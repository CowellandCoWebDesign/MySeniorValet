/**
 * Startup Optimizer
 * Manages application startup sequence for optimal performance
 */

interface StartupTask {
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  fn: () => Promise<void>;
  defer?: number; // Milliseconds to defer after server start
}

class StartupOptimizer {
  private tasks: StartupTask[] = [];
  private initialized = new Set<string>();
  private startTime = Date.now();

  addTask(task: StartupTask) {
    this.tasks.push(task);
  }

  async executeCritical() {
    const criticalTasks = this.tasks.filter(t => t.priority === 'critical');
    console.log(`⚡ Executing ${criticalTasks.length} critical startup tasks...`);
    
    await Promise.all(
      criticalTasks.map(async task => {
        if (this.initialized.has(task.name)) {
          console.log(`⏭️  Skipping duplicate: ${task.name}`);
          return;
        }
        
        const taskStart = Date.now();
        try {
          await task.fn();
          this.initialized.add(task.name);
          console.log(`✅ ${task.name} (${Date.now() - taskStart}ms)`);
        } catch (error) {
          console.error(`❌ ${task.name} failed:`, error);
        }
      })
    );
  }

  async executeDeferred() {
    const deferredTasks = this.tasks.filter(t => 
      t.priority !== 'critical' && !this.initialized.has(t.name)
    );
    
    console.log(`\n🚀 Starting ${deferredTasks.length} deferred tasks...`);
    
    // Group by priority
    const highPriority = deferredTasks.filter(t => t.priority === 'high');
    const mediumPriority = deferredTasks.filter(t => t.priority === 'medium');
    const lowPriority = deferredTasks.filter(t => t.priority === 'low');
    
    // Execute high priority immediately
    await this.executeBatch(highPriority, 0);
    
    // Execute medium priority after 2 seconds
    setTimeout(() => this.executeBatch(mediumPriority, 0), 2000);
    
    // Execute low priority after 5 seconds
    setTimeout(() => this.executeBatch(lowPriority, 0), 5000);
  }

  private async executeBatch(tasks: StartupTask[], delay: number) {
    if (tasks.length === 0) return;
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await Promise.all(
      tasks.map(async task => {
        if (this.initialized.has(task.name)) return;
        
        const taskStart = Date.now();
        try {
          if (task.defer) {
            await new Promise(resolve => setTimeout(resolve, task.defer));
          }
          await task.fn();
          this.initialized.add(task.name);
          console.log(`  ✅ ${task.name} (${Date.now() - taskStart}ms)`);
        } catch (error) {
          console.error(`  ❌ ${task.name} failed:`, error);
        }
      })
    );
  }

  reportStartupTime() {
    const totalTime = Date.now() - this.startTime;
    console.log(`\n⏱️  Total startup time: ${totalTime}ms`);
    
    if (totalTime < 3000) {
      console.log('🚀 Lightning fast startup!');
    } else if (totalTime < 5000) {
      console.log('✨ Fast startup achieved');
    } else if (totalTime < 10000) {
      console.log('📊 Normal startup time');
    } else {
      console.log('⚠️  Slow startup - consider optimization');
    }
  }
}

export const startupOptimizer = new StartupOptimizer();

// Helper to prevent duplicate initialization
export function runOnce(name: string, fn: () => Promise<void>): () => Promise<void> {
  let executed = false;
  return async () => {
    if (executed) {
      console.log(`⏭️  Skipping duplicate initialization: ${name}`);
      return;
    }
    executed = true;
    await fn();
  };
}