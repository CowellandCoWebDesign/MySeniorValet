/**
 * Seed Script for Emotional Support Resources
 * Creates sample categories and curated content for TrueView Support Center
 */

import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedSupportResources() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting support resources seeding...');

    // First, insert categories (if they don't exist)
    const categories = [
      {
        name: "Getting Started", 
        description: "Essential guides for beginning your senior living journey",
        icon: "BookOpen",
        colorScheme: "blue",
        displayOrder: 1
      },
      {
        name: "Emotional Support",
        description: "Resources to help navigate the emotional aspects of senior care decisions", 
        icon: "Heart",
        colorScheme: "pink",
        displayOrder: 2
      },
      {
        name: "Financial Planning",
        description: "Understanding costs, insurance, and payment options",
        icon: "DollarSign", 
        colorScheme: "green",
        displayOrder: 3
      },
      {
        name: "Family Communication",
        description: "Tools for difficult conversations and family decision-making",
        icon: "Users",
        colorScheme: "purple", 
        displayOrder: 4
      },
      {
        name: "Transition Support",
        description: "Guides for making the move and adjusting to senior living",
        icon: "ArrowRight",
        colorScheme: "orange",
        displayOrder: 5
      }
    ];

    // Insert categories
    for (const cat of categories) {
      await client.query(`
        INSERT INTO support_resource_categories (name, description, icon, color_scheme, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (name) DO NOTHING
      `, [cat.name, cat.description, cat.icon, cat.colorScheme, cat.displayOrder]);
    }

    // Get category IDs
    const catResult = await client.query('SELECT id, name FROM support_resource_categories');
    const categoryMap = catResult.rows.reduce((acc, row) => {
      acc[row.name] = row.id;
      return acc;
    }, {});

    // Sample curated resources
    const resources = [
      // Getting Started Category
      {
        categoryId: categoryMap["Getting Started"],
        title: "Your First Steps: Understanding Senior Living Options",
        description: "A comprehensive guide to different types of senior living communities and what makes each unique.",
        content: `# Understanding Senior Living Options

When beginning your search for senior living options, it's important to understand the different types of care available and how they align with your loved one's needs.

## Types of Senior Living

### Independent Living
- For seniors who can live independently but want community and convenience
- Typically includes housekeeping, meals, and social activities
- No medical care provided on-site

### Assisted Living  
- For seniors who need help with daily activities like bathing, dressing, or medication management
- 24-hour staff available for assistance
- Meals, housekeeping, and activities included

### Memory Care
- Specialized care for individuals with Alzheimer's disease or other forms of dementia
- Secure environment with trained staff
- Programs designed specifically for memory support

### Skilled Nursing
- 24-hour medical care from licensed nurses
- For individuals with serious medical conditions
- Short-term rehabilitation or long-term care

## Questions to Ask Yourself

1. What level of independence does your loved one currently have?
2. What medical conditions need to be considered?
3. What are the social and emotional needs?
4. What is your budget range?
5. What location preferences are important?

## Next Steps

Take time to discuss these options with your family and healthcare providers. Visit communities in person when possible, and don't rush the decision-making process.`,
        resourceType: "article",
        tags: ["beginner", "overview", "types", "care-levels"],
        targetAudience: ["family_members"],
        careStage: "exploration", 
        emotionalThemes: ["overwhelm", "hope"],
        readingTime: 8,
        difficulty: "beginner",
        authorName: "Dr. Sarah Johnson",
        authorCredentials: "Geriatrician and Senior Living Consultant",
        isFeatured: true
      },
      {
        categoryId: categoryMap["Getting Started"],
        title: "Questions to Ask During Community Tours",
        description: "A comprehensive checklist of important questions to ask when visiting senior living communities.",
        content: `# Essential Questions for Community Tours

## About Care and Services
- What levels of care are available?
- How do you handle emergencies?
- What is the staff-to-resident ratio?
- Are there additional fees for care services?

## About Daily Life
- What does a typical day look like?
- What activities and programs are offered?
- How are meals handled?
- What transportation options are available?

## About Costs
- What is included in the monthly fee?
- What are additional costs I should expect?
- How often do fees increase?
- What payment options do you accept?

## About Policies
- What is your policy on couples with different care needs?
- Can residents bring pets?
- What happens if care needs change?
- What is your visitor policy?`,
        resourceType: "checklist",
        tags: ["tours", "questions", "checklist", "evaluation"],
        targetAudience: ["family_members"],
        careStage: "evaluation",
        emotionalThemes: ["preparation"],
        readingTime: 5,
        difficulty: "beginner",
        authorName: "TrueView Care Team",
        authorCredentials: "Senior Living Specialists",
        isFeatured: false
      },

      // Emotional Support Category  
      {
        categoryId: categoryMap["Emotional Support"],
        title: "Coping with Guilt: You're Making the Right Choice",
        description: "Understanding and working through the complex emotions of choosing senior living for a loved one.",
        content: `# Coping with Guilt in Senior Living Decisions

It's completely normal to feel guilt when considering senior living options for a loved one. This difficult emotion affects nearly every family going through this transition.

## Why Guilt Happens

**Cultural expectations**: Many of us grew up believing we should care for aging parents ourselves.

**Fear of abandonment**: Worry that your loved one will feel abandoned or unloved.

**Loss of control**: Acknowledging that you can't provide all the care needed at home.

**Role reversal**: The difficulty of becoming the decision-maker for someone who once cared for you.

## Reframing Your Perspective

### You're Advocating for Their Best Care
Choosing professional senior living often means better care, safety, and social opportunities than you could provide at home.

### Quality Over Location
Love isn't measured by proximity. Regular visits, calls, and involvement in their care show your commitment.

### Professional Support
Trained staff can provide specialized care that keeps your loved one healthier and happier.

### Preserving Relationships
When daily care stress is removed, you can focus on being a loving family member rather than an overwhelmed caregiver.

## Healthy Coping Strategies

1. **Talk to others** who have made similar decisions
2. **Focus on the positives** your loved one will gain
3. **Stay involved** in their care and daily life
4. **Practice self-compassion** - you're doing your best
5. **Seek counseling** if guilt becomes overwhelming

## Remember

You are making a loving, thoughtful decision based on what's best for your loved one's health, safety, and quality of life. That's not something to feel guilty about - it's something to feel proud of.`,
        resourceType: "article",
        tags: ["guilt", "emotions", "family", "decision-making"],
        targetAudience: ["family_members"],
        careStage: "evaluation",
        emotionalThemes: ["guilt", "acceptance"],
        readingTime: 6,
        difficulty: "beginner", 
        authorName: "Dr. Maria Rodriguez",
        authorCredentials: "Licensed Clinical Social Worker, Specializing in Aging",
        isFeatured: true
      },

      // Financial Planning Category
      {
        categoryId: categoryMap["Financial Planning"],
        title: "Understanding Senior Living Costs: A Complete Breakdown",
        description: "Comprehensive guide to senior living costs, payment options, and financial planning strategies.",
        content: `# Understanding Senior Living Costs

## Average Cost Ranges by Care Type

### Independent Living
- **National Average**: $2,500 - $4,500/month
- **California Average**: $3,500 - $6,500/month
- **Includes**: Apartment, meals, housekeeping, activities

### Assisted Living  
- **National Average**: $4,000 - $6,500/month
- **California Average**: $5,500 - $9,000/month
- **Includes**: Personal care assistance, meals, medication management

### Memory Care
- **National Average**: $5,500 - $8,500/month  
- **California Average**: $7,000 - $12,000/month
- **Includes**: Specialized dementia care, secure environment

### Skilled Nursing
- **National Average**: $7,500 - $12,000/month
- **California Average**: $9,000 - $15,000/month
- **Includes**: 24-hour medical care, rehabilitation services

## Payment Options

### Private Pay
- Most common initial payment method
- Gives you choice of any community
- Allows for quicker move-in process

### Long-Term Care Insurance
- Check policy details for coverage
- Some policies have waiting periods
- May cover partial costs

### Veterans Benefits
- **Aid & Attendance**: Up to $2,500/month for veterans, $1,500 for surviving spouses
- **VA Pension**: Additional monthly benefit
- Must meet service and financial requirements

### Medicaid
- Limited to Medicaid-certified communities
- Must meet financial and medical requirements
- Typically covers skilled nursing level care

## Financial Planning Tips

1. **Start planning early** - costs increase over time
2. **Consider long-term care insurance** while healthy
3. **Explore VA benefits** if veteran or spouse
4. **Keep detailed financial records** for benefit applications
5. **Consult with elder law attorney** for complex situations

## Hidden Costs to Consider

- Move-in fees or deposits
- Care level increases
- Medical supplies and equipment  
- Transportation for medical appointments
- Personal items and clothing replacement

Remember: Investing in proper senior living often costs less than 24-hour home care while providing better social opportunities and specialized care.`,
        resourceType: "guide",
        tags: ["costs", "budgeting", "payment", "veterans", "medicaid"],
        targetAudience: ["family_members"],
        careStage: "evaluation", 
        emotionalThemes: ["overwhelm"],
        readingTime: 10,
        difficulty: "intermediate",
        authorName: "James Chen, CFP",
        authorCredentials: "Certified Financial Planner, Elder Care Specialist",
        isFeatured: true
      },

      // Family Communication Category
      {
        categoryId: categoryMap["Family Communication"],
        title: "Having 'The Conversation': Talking to Your Loved One About Senior Living",
        description: "Strategies for approaching difficult conversations about transitioning to senior living with compassion and respect.",
        content: `# Having 'The Conversation' About Senior Living

Starting the conversation about senior living can feel overwhelming, but approaching it with compassion and preparation makes all the difference.

## Before You Start

### Choose the Right Time and Place
- Pick a time when everyone is relaxed and not rushed
- Choose a comfortable, private setting
- Avoid bringing it up during stressful situations or medical crises

### Prepare Emotionally
- Expect resistance and emotional reactions
- Be ready to have multiple conversations over time
- Focus on listening, not convincing

## Conversation Starters

### Focus on Safety and Independence
"I want you to be able to stay independent as long as possible. Let's talk about what that might look like."

### Express Your Concerns
"I've been worried about you living alone. Can we talk about some options that might help me feel less anxious while keeping you comfortable?"

### Involve Them in Planning
"I'd love your input on planning for the future. What's most important to you as you think about the next few years?"

## Common Responses and How to Handle Them

### "I'm not ready"
**Response**: "I understand this feels sudden. We don't need to decide anything today. Let's just explore what options might be available when you are ready."

### "I don't want to be a burden"
**Response**: "You're not a burden. We want to find the best situation where you can be happy, safe, and independent."

### "I want to stay in my home"
**Response**: "I know how much your home means to you. Let's talk about what you love most about it and see if we can find those same things elsewhere."

## Conversation Tips

1. **Listen more than you talk**
2. **Acknowledge their feelings** before sharing facts
3. **Focus on benefits**, not limitations
4. **Involve them in research** and decision-making
5. **Be patient** - this may take many conversations
6. **Consider professional help** from social workers or counselors

## What NOT to Say

- "You can't live alone anymore"
- "We've already decided"
- "It's just like a hotel"
- "You'll love it there"
- "Everyone your age is doing this"

## Making it Collaborative

- Visit communities together
- Include them in financial discussions
- Let them interview potential caregivers
- Respect their timeline when possible
- Celebrate the positives they identify

## Remember

This conversation is about preserving dignity and autonomy while addressing legitimate safety concerns. Your loved one's input and consent are crucial for a successful transition.`,
        resourceType: "guide",
        tags: ["communication", "conversation", "family", "resistance"],
        targetAudience: ["family_members"],
        careStage: "exploration",
        emotionalThemes: ["anxiety", "hope"],
        readingTime: 8,
        difficulty: "intermediate",
        authorName: "Dr. Patricia Williams",
        authorCredentials: "Geriatric Social Worker, Family Counselor", 
        isFeatured: true
      },

      // Transition Support Category
      {
        categoryId: categoryMap["Transition Support"],
        title: "Moving Day: A Step-by-Step Guide for Senior Living Transition",
        description: "Practical advice for making moving day smooth and less stressful for your loved one.",
        content: `# Moving Day: A Smooth Transition Guide

Moving to senior living is a major life change. These practical steps can help make the transition smoother for everyone involved.

## Two Weeks Before Moving Day

### Documentation
- [ ] Gather all important documents (medical records, insurance, legal papers)
- [ ] Transfer prescriptions to nearby pharmacy
- [ ] Update address with banks, insurance, and government agencies
- [ ] Arrange mail forwarding with postal service

### Medical Coordination  
- [ ] Schedule final appointments with current doctors
- [ ] Arrange for medical records transfer
- [ ] Ensure adequate medication supply for transition period
- [ ] Research nearby medical providers if needed

## One Week Before Moving Day

### Packing Strategy
- [ ] Pack a "first day" box with essentials
- [ ] Label boxes clearly for movers
- [ ] Pack medications and important documents separately to carry personally
- [ ] Prepare comfort items for immediate setup

### Communication
- [ ] Confirm moving details with the community
- [ ] Share moving timeline with family members
- [ ] Arrange for someone to stay with your loved one on moving day

## Moving Day Essentials

### First Day Box Should Include:
- Medications and pill organizer
- Comfortable clothing for several days  
- Personal hygiene items
- Important phone numbers
- Favorite photos or small mementos
- Snacks and beverages they enjoy
- Phone charger and any assistive devices

### For Emotional Support:
- Familiar blanket or pillow
- Favorite books or magazines
- Photo albums
- Small religious or spiritual items
- Favorite tea or coffee

## First Week Strategies

### Helping Them Settle
1. **Maintain routines** as much as possible
2. **Encourage participation** in one activity per day
3. **Eat meals** in the community dining room
4. **Meet one new person** each day
5. **Explore one new area** of the community daily

### Family Support
- Visit regularly but not overwhelmingly
- Bring updates from home and neighborhood
- Listen to concerns without immediately trying to solve them
- Celebrate small victories and positive experiences

## Red Flags to Watch For

- Refusing to leave their room for extended periods
- Not eating meals
- Expressing hopelessness about the situation
- Significant sleep disturbances
- Withdrawal from family communication

If you notice these signs, reach out to the community's social worker or your loved one's doctor.

## Normal Adjustment Challenges

Remember that feeling sad, confused, or overwhelmed is normal during the first 30-90 days. Most residents report feeling more positive about their move after 3-6 months.

## When to Get Help

Don't hesitate to ask the community staff for support. They've helped many families through this transition and have resources and strategies that can help.`,
        resourceType: "guide",
        tags: ["moving", "transition", "adjustment", "checklist"],
        targetAudience: ["family_members"],
        careStage: "transition",
        emotionalThemes: ["anxiety", "hope"],
        readingTime: 7,
        difficulty: "beginner",
        authorName: "Linda Thompson, MSW",
        authorCredentials: "Senior Living Transition Specialist",
        isFeatured: false
      }
    ];

    // Insert resources
    for (const resource of resources) {
      await client.query(`
        INSERT INTO support_resources (
          category_id, title, description, content, resource_type, tags, target_audience, 
          care_stage, emotional_themes, reading_time, difficulty, author_name, 
          author_credentials, is_featured, view_count, helpful_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (title) DO NOTHING
      `, [
        resource.categoryId, resource.title, resource.description, resource.content,
        resource.resourceType, resource.tags, resource.targetAudience, resource.careStage,
        resource.emotionalThemes, resource.readingTime, resource.difficulty, 
        resource.authorName, resource.authorCredentials, resource.isFeatured,
        Math.floor(Math.random() * 50) + 10, // Random view count
        Math.floor(Math.random() * 20) + 5   // Random helpful count
      ]);
    }

    console.log('✅ Support resources seeded successfully!');
    console.log(`📚 Created ${categories.length} categories`);
    console.log(`📝 Created ${resources.length} resources`);

  } catch (error) {
    console.error('❌ Error seeding support resources:', error);
  } finally {
    client.release();
  }
}

// Run the seeding
seedSupportResources().then(() => {
  console.log('🎉 Seeding complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});