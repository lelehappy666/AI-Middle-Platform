// 数据库清理工具
import { mediaStorage } from './storage';

class DatabaseCleanup {
  private storage: typeof mediaStorage;

  constructor() {
    this.storage = mediaStorage;
  }

  // 清理损坏的记录
  async cleanupCorruptedRecords(): Promise<void> {
    console.log('开始清理损坏的数据库记录...');
    
    try {
      await this.storage.init();
      
      // 获取所有记录
      const db = (this.storage as any).ensureDB();
      const transaction = db.transaction(['mediaFiles'], 'readwrite');
      const store = transaction.objectStore('mediaFiles');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allRecords = request.result;
        let corruptedCount = 0;
        let cleanedCount = 0;
        
        console.log(`找到 ${allRecords.length} 条记录`);
        
        allRecords.forEach((record: any) => {
          if (!record.originalFile || record.originalFile.size === 0) {
            console.log(`发现损坏记录: ${record.name} (ID: ${record.id})`);
            corruptedCount++;
            
            // 删除损坏的记录
            const deleteRequest = store.delete(record.id);
            deleteRequest.onsuccess = () => {
              cleanedCount++;
              console.log(`已删除损坏记录: ${record.name}`);
            };
          }
        });
        
        transaction.oncomplete = () => {
          console.log(`清理完成！删除了 ${cleanedCount}/${corruptedCount} 条损坏记录`);
        };
      };
      
      request.onerror = () => {
        console.error('获取数据库记录失败');
      };
      
    } catch (error) {
      console.error('清理数据库时出错:', error);
    }
  }

  // 完全重置数据库
  async resetDatabase(): Promise<void> {
    console.log('开始重置数据库...');
    
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase('MediaLibraryDB');
      
      deleteRequest.onsuccess = () => {
        console.log('数据库已重置');
        resolve();
      };
      
      deleteRequest.onerror = () => {
        console.error('重置数据库失败');
        reject(new Error('重置数据库失败'));
      };
      
      deleteRequest.onblocked = () => {
        console.warn('数据库重置被阻塞，请关闭所有标签页后重试');
      };
    });
  }
}

// 导出清理工具
export const dbCleanup = new DatabaseCleanup();

// 在控制台中可用的全局函数
(window as any).cleanupDB = () => dbCleanup.cleanupCorruptedRecords();
(window as any).resetDB = () => dbCleanup.resetDatabase();

console.log('数据库清理工具已加载！');
console.log('使用 cleanupDB() 清理损坏记录');
console.log('使用 resetDB() 完全重置数据库');