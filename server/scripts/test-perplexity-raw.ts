import { perplexityService } from '../perplexity-ai-service';

async function testPerplexityRaw() {
  console.log('🔍 TESTING RAW PERPLEXITY RESPONSE FOR LOS ANGELES');
  console.log('='.repeat(60));
  
  const query = `Give me a comprehensive list of ALL senior living and assisted living facilities in Los Angeles, CA metropolitan area.
    
    I need COMPLETE listings including:
    - All major chains (Brookdale, Sunrise, Atria, etc.)
    - All local operators and independent facilities
    - All small residential care homes
    - All nonprofit and faith-based facilities
    
    For EACH facility provide:
    - Exact facility name
    - Full street address
    - City, State ZIP code  
    - Phone number
    
    List ALL facilities you can find - aim for 20-30 facilities.
    Focus on Los Angeles metro area including suburbs.
    Include facilities from 2024-2025 data.`;
  
  try {
    const result = await perplexityService.searchRealTime(query);
    
    console.log('\n📄 RAW RESPONSE:');
    console.log('-'.repeat(60));
    console.log(result.summary);
    console.log('-'.repeat(60));
    
    console.log('\n📊 RESPONSE LENGTH:', result.summary?.length || 0, 'characters');
    console.log('📚 SOURCES:', result.sources?.length || 0, 'sources');
    
    // Let's also count potential facilities in the response
    const lines = (result.summary || '').split('\n');
    const potentialFacilities = lines.filter(line => 
      line.match(/^[-•*]\s+/) || 
      line.match(/^\d+[\.)]\s+/) ||
      line.toLowerCase().includes('senior') ||
      line.toLowerCase().includes('assisted') ||
      line.toLowerCase().includes('care')
    );
    
    console.log('🏢 POTENTIAL FACILITY LINES:', potentialFacilities.length);
    
    if (potentialFacilities.length > 0) {
      console.log('\n📋 FIRST 5 POTENTIAL FACILITIES:');
      potentialFacilities.slice(0, 5).forEach(line => {
        console.log('  >', line.trim());
      });
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

testPerplexityRaw().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});