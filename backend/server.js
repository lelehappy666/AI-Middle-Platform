const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// 添加请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
const imageDir = path.join(uploadsDir, 'Image');
const videoDir = path.join(uploadsDir, 'Video');

fs.ensureDirSync(imageDir);
fs.ensureDirSync(videoDir);

// 静态文件服务
app.use('/uploads', express.static(uploadsDir));

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'image';
    const dir = type === 'video' ? videoDir : imageDir;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 内存存储文件信息（实际项目中应使用数据库）
let fileDatabase = {
  images: [],
  videos: []
};

// 扫描现有文件并加载到内存
function loadExistingFiles() {
  try {
    // 加载图片
    if (fs.existsSync(imageDir)) {
      const imageFiles = fs.readdirSync(imageDir);
      fileDatabase.images = imageFiles.map(filename => {
        const filePath = path.join(imageDir, filename);
        const stats = fs.statSync(filePath);
        return {
          id: uuidv4(),
          name: filename,
          type: 'image',
          size: stats.size,
          lastModified: stats.mtime.getTime(),
          url: `http://localhost:${PORT}/uploads/Image/${filename}`,
          folderPath: 'Image'
        };
      });
    }

    // 加载视频
    if (fs.existsSync(videoDir)) {
      const videoFiles = fs.readdirSync(videoDir);
      fileDatabase.videos = videoFiles.map(filename => {
        const filePath = path.join(videoDir, filename);
        const stats = fs.statSync(filePath);
        return {
          id: uuidv4(),
          name: filename,
          type: 'video',
          size: stats.size,
          lastModified: stats.mtime.getTime(),
          url: `http://localhost:${PORT}/uploads/Video/${filename}`,
          folderPath: 'Video'
        };
      });
    }

    console.log(`加载了 ${fileDatabase.images.length} 张图片和 ${fileDatabase.videos.length} 个视频`);
  } catch (error) {
    console.error('加载现有文件失败:', error);
  }
}

// API路由

// 获取图片列表
app.get('/api/files/images', (req, res) => {
  res.json({
    success: true,
    data: fileDatabase.images
  });
});

// 获取视频列表
app.get('/api/files/videos', (req, res) => {
  res.json({
    success: true,
    data: fileDatabase.videos
  });
});

// 上传文件
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const { type } = req.body;
    const fileInfo = {
      id: uuidv4(),
      name: req.file.originalname,
      type: type || 'image',
      size: req.file.size,
      lastModified: Date.now(),
      url: `http://localhost:${PORT}/uploads/${type === 'video' ? 'Video' : 'Image'}/${req.file.filename}`,
      folderPath: type === 'video' ? 'Video' : 'Image'
    };

    // 添加到内存数据库
    if (type === 'video') {
      fileDatabase.videos.push(fileInfo);
    } else {
      fileDatabase.images.push(fileInfo);
    }

    res.json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '文件上传失败'
    });
  }
});

// 删除文件
app.delete('/api/files/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 从图片中查找
    let fileIndex = fileDatabase.images.findIndex(f => f.id === id);
    let fileType = 'image';
    
    if (fileIndex === -1) {
      // 从视频中查找
      fileIndex = fileDatabase.videos.findIndex(f => f.id === id);
      fileType = 'video';
    }
    
    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    const file = fileType === 'video' ? fileDatabase.videos[fileIndex] : fileDatabase.images[fileIndex];
    
    // 删除物理文件
    const filename = path.basename(file.url);
    const filePath = path.join(__dirname, 'uploads', file.folderPath, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // 从内存数据库中删除
    if (fileType === 'video') {
      fileDatabase.videos.splice(fileIndex, 1);
    } else {
      fileDatabase.images.splice(fileIndex, 1);
    }
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('文件删除失败:', error);
    res.status(500).json({
      success: false,
      message: '文件删除失败'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  loadExistingFiles();
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});