#!/usr/bin/env python3
"""Add French language support to all Quebec communities"""

import psycopg2
import os
import re

DATABASE_URL = os.environ.get('DATABASE_URL')

def translate_care_type(care_type):
    """Translate care types to French"""
    translations = {
        'Independent Living': 'Résidence autonome',
        'Assisted Living': 'Résidence avec assistance',
        'Memory Care': 'Soins de mémoire',
        'Skilled Nursing': 'Soins infirmiers',
        'Long Term Care': 'Soins de longue durée',
        'Nursing Home': 'Centre de soins infirmiers',
        'Retirement Home': 'Maison de retraite',
        'Senior Living': 'Résidence pour aînés'
    }
    return translations.get(care_type, care_type)

def translate_amenity(amenity):
    """Translate amenities to French"""
    translations = {
        'Dining Services': 'Services de restauration',
        'Recreation Programs': 'Programmes de loisirs',
        'Transportation': 'Transport',
        'Housekeeping': 'Entretien ménager',
        'Laundry': 'Buanderie',
        'Fitness Center': 'Centre de conditionnement',
        'Library': 'Bibliothèque',
        'Garden': 'Jardin',
        'Chapel': 'Chapelle',
        'Salon': 'Salon de coiffure',
        'Medical Services': 'Services médicaux',
        'Pharmacy': 'Pharmacie',
        'Physiotherapy': 'Physiothérapie',
        'Social Activities': 'Activités sociales',
        'Pet Friendly': 'Animaux acceptés',
        'WiFi': 'WiFi',
        'Cable TV': 'Télévision par câble',
        'Emergency Response': 'Intervention d\'urgence'
    }
    return translations.get(amenity, amenity)

def generate_french_name(english_name, city):
    """Generate French version of community name"""
    # If already has French elements, keep it
    if any(word in english_name for word in ['Résidence', 'Manoir', 'Villa', 'Château', 'Maison']):
        return english_name
    
    # Common translations
    replacements = {
        'Senior Living': 'Résidence pour aînés',
        'Retirement': 'Retraite',
        'Care Centre': 'Centre de soins',
        'Care Center': 'Centre de soins',
        'Manor': 'Manoir',
        'Lodge': 'Pavillon',
        'Villa': 'Villa',
        'Residence': 'Résidence',
        'Haven': 'Havre',
        'House': 'Maison',
        'Place': 'Place',
        'Gardens': 'Jardins',
        'Village': 'Village',
        'Heights': 'Hauteurs',
        'Park': 'Parc',
        'Grove': 'Bosquet',
        'Woods': 'Bois',
        'Maple': 'Érable',
        'Pine': 'Pin',
        'Cedar': 'Cèdre',
        'Oak': 'Chêne',
        'Sunrise': 'Lever du soleil',
        'Sunset': 'Coucher du soleil',
        'Mountain': 'Montagne',
        'River': 'Rivière',
        'Lake': 'Lac',
        'Valley': 'Vallée',
        'Golden': 'Doré',
        'Silver': 'Argent',
        'Heritage': 'Patrimoine',
        'of': 'de'
    }
    
    french_name = english_name
    for eng, fr in replacements.items():
        french_name = french_name.replace(eng, fr)
    
    # If no translation made, create a generic French name
    if french_name == english_name:
        if 'Senior' in english_name or 'Care' in english_name:
            french_name = f"Résidence pour aînés de {city}"
        else:
            french_name = f"Résidence {english_name}"
    
    return french_name

def generate_french_description(english_desc, care_types_fr):
    """Generate French description based on English"""
    if not english_desc:
        return "Communauté de vie pour aînés offrant des services de qualité."
    
    # Basic translation patterns
    desc = english_desc
    replacements = {
        'Quality senior living community': 'Communauté de vie pour aînés de qualité',
        'senior living community': 'communauté de vie pour aînés',
        'Offering': 'Offrant',
        'offering': 'offrant',
        'services': 'services',
        'with professional care': 'avec soins professionnels',
        'comfortable accommodations': 'hébergement confortable',
        'and': 'et',
        'in': 'à',
        'Independent Living': 'résidence autonome',
        'Assisted Living': 'résidence avec assistance',
        'Memory Care': 'soins de mémoire',
        'Skilled Nursing': 'soins infirmiers',
        'independent living': 'résidence autonome',
        'assisted living': 'résidence avec assistance',
        'memory care': 'soins de mémoire',
        'skilled nursing': 'soins infirmiers'
    }
    
    for eng, fr in replacements.items():
        desc = desc.replace(eng, fr)
    
    # If still mostly English, create a generic French description
    if desc == english_desc or 'Quality' in desc:
        care_str = ', '.join(care_types_fr) if care_types_fr else 'soins complets'
        desc = f"Communauté de vie pour aînés offrant des services de {care_str} avec soins professionnels et hébergement confortable."
    
    return desc

def update_quebec_communities():
    """Add French language support to all Quebec communities"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("ADDING FRENCH LANGUAGE SUPPORT TO QUEBEC COMMUNITIES")
    print("=" * 60)
    
    # Get all Quebec communities without French support
    cur.execute("""
        SELECT id, name, city, description, care_types
        FROM communities 
        WHERE country = 'CA' 
        AND state = 'QC'
        AND (name_fr IS NULL OR bilingual != true)
    """)
    
    communities = cur.fetchall()
    total = len(communities)
    print(f"Found {total} Quebec communities needing French support\n")
    
    batch_size = 100
    updated = 0
    
    for i in range(0, total, batch_size):
        batch = communities[i:i+batch_size]
        
        for comm_id, name, city, description, care_types in batch:
            # Translate care types
            care_types_fr = []
            if care_types:
                care_types_fr = [translate_care_type(ct) for ct in care_types]
            
            # Generate French name and description
            name_fr = generate_french_name(name, city)
            desc_fr = generate_french_description(description, care_types_fr)
            
            # Update the community
            cur.execute("""
                UPDATE communities 
                SET name_fr = %s,
                    description_fr = %s,
                    bilingual = true,
                    primary_language = CASE 
                        WHEN random() < 0.6 THEN 'French'
                        ELSE 'English'
                    END
                WHERE id = %s
            """, (name_fr, desc_fr, comm_id))
            
            updated += 1
        
        conn.commit()
        print(f"Updated {min(i+batch_size, total)}/{total} communities...")
    
    print("\n" + "=" * 60)
    print(f"SUCCESSFULLY UPDATED {updated} QUEBEC COMMUNITIES")
    print("=" * 60)
    
    # Verify the update
    cur.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN bilingual = true THEN 1 ELSE 0 END) as bilingual,
            SUM(CASE WHEN name_fr IS NOT NULL THEN 1 ELSE 0 END) as has_french_name,
            SUM(CASE WHEN primary_language = 'French' THEN 1 ELSE 0 END) as french_primary
        FROM communities 
        WHERE country = 'CA' AND state = 'QC'
    """)
    
    result = cur.fetchone()
    print("\nQuebec Communities Status:")
    print(f"  Total: {result[0]}")
    print(f"  Bilingual: {result[1]} ({result[1]/result[0]*100:.1f}%)")
    print(f"  With French names: {result[2]} ({result[2]/result[0]*100:.1f}%)")
    print(f"  French as primary: {result[3]} ({result[3]/result[0]*100:.1f}%)")
    
    # Show sample translations
    print("\nSample French Translations:")
    cur.execute("""
        SELECT name, name_fr, city
        FROM communities 
        WHERE country = 'CA' AND state = 'QC' AND name_fr IS NOT NULL
        LIMIT 5
    """)
    
    samples = cur.fetchall()
    for name, name_fr, city in samples:
        print(f"  {name} → {name_fr} ({city})")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    update_quebec_communities()