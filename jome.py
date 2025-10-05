import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
import math
import time

print("🌌 Creating Live Sky Map for Your Location...")
print("Showing constellations currently above you...")

# CONSTELLATION DATA - Real star positions
CONSTELLATIONS = {
    "Orion": {
        "stars": [
            {"name": "Betelgeuse", "ra": 88.79, "dec": 7.41, "mag": 0.45},
            {"name": "Bellatrix", "ra": 81.28, "dec": 6.35, "mag": 1.64},
            {"name": "Mintaka", "ra": 83.00, "dec": -0.30, "mag": 2.25},
            {"name": "Alnilam", "ra": 84.05, "dec": -1.20, "mag": 1.70},
            {"name": "Alnitak", "ra": 85.19, "dec": -1.94, "mag": 1.77},
            {"name": "Saiph", "ra": 86.93, "dec": -9.67, "mag": 2.07},
            {"name": "Rigel", "ra": 78.63, "dec": -8.20, "mag": 0.18}
        ],
        "lines": [(0,1), (1,2), (2,3), (3,4), (1,5), (5,6)]
    },
    "Ursa Major": {
        "stars": [
            {"name": "Dubhe", "ra": 165.93, "dec": 61.75, "mag": 1.79},
            {"name": "Merak", "ra": 165.46, "dec": 56.38, "mag": 2.37},
            {"name": "Phecda", "ra": 178.46, "dec": 53.69, "mag": 2.44},
            {"name": "Megrez", "ra": 183.86, "dec": 57.03, "mag": 3.32},
            {"name": "Alioth", "ra": 193.51, "dec": 55.96, "mag": 1.76},
            {"name": "Mizar", "ra": 200.98, "dec": 54.93, "mag": 2.23},
            {"name": "Alkaid", "ra": 206.89, "dec": 49.31, "mag": 1.86}
        ],
        "lines": [(0,1), (1,2), (2,3), (3,4), (4,5), (5,6)]
    },
    "Cassiopeia": {
        "stars": [
            {"name": "Schedar", "ra": 10.13, "dec": 56.54, "mag": 2.24},
            {"name": "Caph", "ra": 2.29, "dec": 59.15, "mag": 2.28},
            {"name": "Gamma Cas", "ra": 14.18, "dec": 60.72, "mag": 2.47},
            {"name": "Segin", "ra": 28.60, "dec": 63.67, "mag": 3.38},
            {"name": "Achird", "ra": 13.79, "dec": 57.82, "mag": 3.46}
        ],
        "lines": [(0,1), (1,2), (2,3), (3,4)]
    },
    "Leo": {
        "stars": [
            {"name": "Regulus", "ra": 152.09, "dec": 11.97, "mag": 1.36},
            {"name": "Denebola", "ra": 177.27, "dec": 14.57, "mag": 2.14},
            {"name": "Algieba", "ra": 154.99, "dec": 19.84, "mag": 2.61},
            {"name": "Zosma", "ra": 168.56, "dec": 20.52, "mag": 2.56},
            {"name": "Chertan", "ra": 168.56, "dec": 15.43, "mag": 3.33}
        ],
        "lines": [(0,2), (2,3), (3,1), (3,4)]
    }
}

def radec_to_altaz(ra, dec, lat, lon, current_time=None):
    """Convert RA/Dec to Altitude/Azimuth for your location"""
    if current_time is None:
        current_time = datetime.now()
    
    # Calculate Local Sidereal Time
    utc_hours = current_time.hour + current_time.minute/60 + current_time.second/3600
    jd = current_time.timetuple().tm_yday + 2440587.5  # Approximate Julian Date
    lst = (100.46 + 0.985647 * jd + lon + 15*utc_hours) % 360
    
    # Hour Angle
    ha = (lst - ra) % 360
    if ha > 180:
        ha -= 360
    
    # Convert to radians
    ha_rad = math.radians(ha)
    dec_rad = math.radians(dec)
    lat_rad = math.radians(lat)
    
    # Calculate Altitude
    alt_rad = math.asin(math.sin(dec_rad) * math.sin(lat_rad) + 
                       math.cos(dec_rad) * math.cos(lat_rad) * math.cos(ha_rad))
    alt = math.degrees(alt_rad)
    
    # Calculate Azimuth
    az_rad = math.atan2(-math.sin(ha_rad), 
                        math.tan(dec_rad) * math.cos(lat_rad) - math.sin(lat_rad) * math.cos(ha_rad))
    az = math.degrees(az_rad) % 360
    
    return alt, az

def get_visible_constellations(lat, lon):
    """Get constellations currently visible at your location"""
    current_time = datetime.now()
    visible_data = {}
    
    for const_name, const_data in CONSTELLATIONS.items():
        visible_stars = []
        
        for star in const_data["stars"]:
            alt, az = radec_to_altaz(star["ra"], star["dec"], lat, lon, current_time)
            
            # Only include stars above horizon
            if alt > 5:  # At least 5° above horizon
                visible_stars.append({
                    "name": star["name"],
                    "alt": alt,
                    "az": az,
                    "mag": star["mag"],
                    "ra": star["ra"],
                    "dec": star["dec"]
                })
        
        # Only include constellations with at least 3 visible stars
        if len(visible_stars) >= 3:
            visible_data[const_name] = {
                "stars": visible_stars,
                "lines": const_data["lines"]
            }
            print(f"✨ {const_name}: {len(visible_stars)} stars visible")
    
    return visible_data

def create_sky_map(lat, lon, location_name="Your Location"):
    """Create a live sky map for your location"""
    # Get visible constellations
    constellations = get_visible_constellations(lat, lon)
    
    if not constellations:
        print("❌ No constellations visible right now. Try again at night!")
        return
    
    # Create the plot
    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': 'polar'})
    
    # Set up the polar plot (azimuth = angle, altitude = radius)
    ax.set_theta_zero_location('N')  # North at top
    ax.set_theta_direction(-1)       # Clockwise
    ax.set_ylim(0, 90)               # Altitude from 0° (horizon) to 90° (zenith)
    ax.set_rorigin(-10)              # Move center down a bit
    
    # Style the plot
    ax.set_facecolor('navy')
    fig.patch.set_facecolor('darkblue')
    
    # Draw altitude circles
    for alt in [30, 60]:
        ax.plot(np.linspace(0, 2*np.pi, 100), [alt]*100, 'w--', alpha=0.3, linewidth=0.5)
    
    # Draw azimuth lines
    for az in range(0, 360, 30):
        az_rad = np.radians(az)
        ax.plot([az_rad, az_rad], [0, 90], 'w--', alpha=0.3, linewidth=0.5)
    
    # Plot constellations
    colors = ['yellow', 'cyan', 'magenta', 'lime', 'orange']
    
    for i, (const_name, const_data) in enumerate(constellations.items()):
        color = colors[i % len(colors)]
        stars = const_data["stars"]
        lines = const_data["lines"]
        
        # Convert star positions to polar coordinates
        star_positions = []
        for star in stars:
            az_rad = np.radians(star["az"])
            alt = 90 - star["alt"]  # Invert so horizon is outer circle
            star_positions.append((az_rad, alt, star["name"], star["mag"]))
        
        # Draw constellation lines
        for idx1, idx2 in lines:
            if idx1 < len(star_positions) and idx2 < len(star_positions):
                az1, alt1, name1, mag1 = star_positions[idx1]
                az2, alt2, name2, mag2 = star_positions[idx2]
                ax.plot([az1, az2], [alt1, alt2], color=color, linewidth=2, alpha=0.8)
        
        # Draw stars
        for az_rad, alt, name, mag in star_positions:
            size = max(20, 100 - mag * 20)  # Size based on magnitude
            alpha = max(0.3, 1.0 - mag * 0.2)  # Brightness based on magnitude
            
            ax.scatter(az_rad, alt, s=size, color=color, alpha=alpha, edgecolors='white')
            
            # Label bright stars
            if mag < 2.5:
                ax.text(az_rad, alt + 2, name, color='white', 
                       fontsize=8, ha='center', va='bottom')
    
    # Add labels and info
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    plt.title(f"Live Sky Map - {location_name}\n{current_time}", 
              color='white', fontsize=14, pad=20)
    
    # Add compass directions
    for direction, angle in [('N', 0), ('E', 90), ('S', 180), ('W', 270)]:
        ax.text(np.radians(angle), 95, direction, color='white', 
               fontsize=12, ha='center', va='center')
    
    # Add altitude labels
    for alt in [0, 30, 60]:
        label_alt = 90 - alt
        ax.text(0, label_alt, f'{alt}°', color='white', fontsize=8, 
               ha='right', va='center')
    
    print(f"✅ Found {len(constellations)} constellations visible right now!")
    plt.tight_layout()
    plt.show()

def get_user_location():
    """Get location from user"""
    print("\n📍 Enter your location coordinates:")
    
    # You can hardcode your coordinates here:
    # return 40.7128, -74.0060, "New York, NY"  # Example
    
    try:
        lat = float(input("Latitude (e.g., 40.7128): ").strip())
        lon = float(input("Longitude (e.g., -74.0060): ").strip())
        name = input("Location name (e.g., New York): ").strip()
        return lat, lon, name
    except:
        print("❌ Invalid input. Using default location (New York).")
        return 40.7128, -74.0060, "New York, NY"

def main():
    print("🌠 LIVE SKY MAP")
    print("=" * 50)
    
    # Get user location
    lat, lon, location_name = get_user_location()
    
    print(f"\n📍 Location: {location_name} ({lat:.4f}, {lon:.4f})")
    print("🕐 Current time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("🔭 Calculating visible constellations...")
    
    # Create the sky map
    create_sky_map(lat, lon, location_name)

if __name__ == "__main__":
    main()
