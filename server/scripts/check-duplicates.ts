#!/usr/bin/env tsx
import { DuplicateDetectionService } from '../services/duplicate-detection-service';

async function main() {
  console.log('🔍 MySeniorValet Duplicate Detection Report');
  console.log('='.repeat(50));
  
  const service = new DuplicateDetectionService();
  
  // Get overall statistics
  console.log('\n📊 Overall Statistics:');
  const stats = await service.getDuplicateStats();
  console.log(`  Total Communities: ${stats.totalCommunities.toLocaleString()}`);
  console.log(`  Estimated Duplicates: ${stats.estimatedDuplicates.toLocaleString()}`);
  console.log(`  Duplicate Groups: ${stats.duplicateGroups.toLocaleString()}`);
  console.log(`  Percentage Duplicated: ${stats.percentageDuplicated}%`);
  
  if (stats.topDuplicatedStates.length > 0) {
    console.log('\n📍 Top States with Duplicates:');
    stats.topDuplicatedStates.forEach(state => {
      console.log(`  ${state.state}: ${state.count} duplicates`);
    });
  }
  
  // Find duplicates with different thresholds
  console.log('\n🎯 Duplicate Detection by Similarity:');
  
  const thresholds = [95, 90, 85, 80];
  for (const threshold of thresholds) {
    const groups = await service.findDuplicates(threshold);
    const totalDups = groups.reduce((sum, g) => sum + g.duplicates.length, 0);
    console.log(`  ${threshold}% similarity: ${groups.length} groups (${totalDups} duplicates)`);
  }
  
  // Show some examples
  console.log('\n📋 Sample Duplicate Groups (95% similarity):');
  const highConfidenceGroups = await service.findDuplicates(95);
  const samples = highConfidenceGroups.slice(0, 5);
  
  samples.forEach((group, idx) => {
    console.log(`\n  ${idx + 1}. ${group.primaryName}`);
    console.log(`     Location: ${group.primaryLocation}`);
    console.log(`     Duplicates: ${group.duplicates.length}`);
    group.duplicates.slice(0, 2).forEach(dup => {
      console.log(`     - ${dup.name} (${dup.similarity}% match)`);
    });
  });
  
  // Auto-merge recommendation
  console.log('\n💡 Auto-Merge Recommendations:');
  const autoMergeGroups = highConfidenceGroups.filter(g => 
    g.duplicates.length === 1 && g.duplicates[0].similarity >= 95
  );
  console.log(`  ${autoMergeGroups.length} groups can be safely auto-merged (95%+ similarity)`);
  console.log(`  This would remove ${autoMergeGroups.length} duplicate communities`);
  
  // Estimate cleanup impact
  const groups85 = await service.findDuplicates(85);
  const totalDups85 = groups85.reduce((sum, g) => sum + g.duplicates.length, 0);
  const newTotal = stats.totalCommunities - totalDups85;
  const reduction = ((totalDups85 / stats.totalCommunities) * 100).toFixed(1);
  
  console.log('\n🎯 Cleanup Impact (85% threshold):');
  console.log(`  Current Total: ${stats.totalCommunities.toLocaleString()}`);
  console.log(`  After Cleanup: ${newTotal.toLocaleString()}`);
  console.log(`  Reduction: ${totalDups85.toLocaleString()} communities (${reduction}%)`);
  
  console.log('\n✅ Report Complete');
  console.log('='.repeat(50));
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error running duplicate detection:', error);
  process.exit(1);
});