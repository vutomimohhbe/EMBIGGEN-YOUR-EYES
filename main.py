import requests
from flask import Flask, render_template, jsonify, request
from astropy.coordinates import SkyCoord, EarthLocation, AltAz
from astropy.coordinates import get_sun
from astropy.time import Time
import astropy.units as u
import logging
from datetime import datetime
import math
import sqlite3
import os

# Set up logging
logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)

# Configuration
N2YO_API_KEY = '2F28J4-EB67BT-AWJX87-5KV3'

# Default to Johannesburg, but will auto-detect
DEFAULT_LAT = -26.2041
DEFAULT_LNG = 28.0473
DEFAULT_ALT = 1753
SEARCH_RADIUS = 90
CATEGORY_ID = 0

# Initialize SQLite database for comments
def init_db():
    conn = sqlite3.connect('space_comments.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS comments
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         object_name TEXT NOT NULL,
         object_type TEXT NOT NULL,
         user_name TEXT NOT NULL,
         comment TEXT NOT NULL,
         points INTEGER DEFAULT 0,
         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
    ''')
    conn.commit()
    conn.close()

init_db()

# Planet information
PLANETS = {
    'sun': {
        'name': 'Sun',
        'type': 'star',
        'radius': 696340,  # km
        'color': '#FFD700',
        'distance': 0,  # AU
        'info': 'The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma.'
    },
    'mercury': {
        'name': 'Mercury',
        'type': 'planet',
        'radius': 2439.7,
        'color': '#8C8C8C',
        'distance': 0.39,
        'info': 'Mercury is the smallest and innermost planet in the Solar System.'
    },
    'venus': {
        'name': 'Venus',
        'type': 'planet', 
        'radius': 6051.8,
        'color': '#E6E6FA',
        'distance': 0.72,
        'info': 'Venus is the second planet from the Sun and is Earth\'s closest planetary neighbor.'
    },
    'earth': {
        'name': 'Earth',
        'type': 'planet',
        'radius': 6371,
        'color': '#1E90FF',
        'distance': 1.0,
        'info': 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.'
    },
    'mars': {
        'name': 'Mars',
        'type': 'planet',
        'radius': 3389.5,
        'color': '#FF6B6B',
        'distance': 1.52,
        'info': 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System.'
    },
    'jupiter': {
        'name': 'Jupiter',
        'type': 'planet',
        'radius': 69911,
        'color': '#F0E68C',
        'distance': 5.20,
        'info': 'Jupiter is the fifth planet from the Sun and the largest in the Solar System.'
    },
    'saturn': {
        'name': 'Saturn',
        'type': 'planet',
        'radius': 58232,
        'color': '#FFD700',
        'distance': 9.58,
        'info': 'Saturn is the sixth planet from the Sun and the second-largest in the Solar System.'
    },
    'moon': {
        'name': 'Moon',
        'type': 'moon',
        'radius': 1737.4,
        'color': '#C0C0C0',
        'distance': 0.00257,  # AU
        'info': 'The Moon is Earth\'s only natural satellite and the fifth largest moon in the Solar System.'
    }
}

# Constellation information database
CONSTELLATION_INFO = {
    'Orion': {
        'name': 'Orion',
        'meaning': 'The Hunter',
        'mythology': 'In Greek mythology, Orion was a giant hunter. He was placed among the stars by Zeus after his death.',
        'stars': 7,
        'brightest_star': 'Rigel',
        'season': 'Winter',
        'area_sq_deg': 594
    },
    'Ursa Major': {
        'name': 'Ursa Major',
        'meaning': 'The Great Bear',
        'mythology': 'Represents Callisto, a nymph turned into a bear by Hera. Also known as the Big Dipper.',
        'stars': 7,
        'brightest_star': 'Alioth',
        'season': 'All Year',
        'area_sq_deg': 1280
    },
    'Cassiopeia': {
        'name': 'Cassiopeia',
        'meaning': 'The Seated Queen',
        'mythology': 'A vain queen punished by Poseidon to circle the North Star forever.',
        'stars': 5,
        'brightest_star': 'Schedar',
        'season': 'Autumn',
        'area_sq_deg': 598
    },
    'Crux': {
        'name': 'Crux',
        'meaning': 'The Southern Cross',
        'mythology': 'Smallest but one of the most famous constellations in the Southern Hemisphere.',
        'stars': 4,
        'brightest_star': 'Acrux',
        'season': 'Spring',
        'area_sq_deg': 68
    },
    'Canis Major': {
        'name': 'Canis Major',
        'meaning': 'The Great Dog',
        'mythology': 'Represents one of Orion\'s hunting dogs, following him across the sky.',
        'stars': 5,
        'brightest_star': 'Sirius',
        'season': 'Winter',
        'area_sq_deg': 380
    },
    'Leo': {
        'name': 'Leo',
        'meaning': 'The Lion',
        'mythology': 'Represents the Nemean Lion slain by Hercules as one of his twelve labors.',
        'stars': 6,
        'brightest_star': 'Regulus',
        'season': 'Spring',
        'area_sq_deg': 947
    },
    'Scorpius': {
        'name': 'Scorpius',
        'meaning': 'The Scorpion',
        'mythology': 'The scorpion that killed Orion. They are placed on opposite sides of the sky.',
        'stars': 7,
        'brightest_star': 'Antares',
        'season': 'Summer',
        'area_sq_deg': 497
    }
}

# Bright stars database
BRIGHT_STARS = [
    # Orion (7 stars)
    {'name': 'Betelgeuse', 'ra': 88.7929, 'dec': 7.4071, 'mag': 0.45, 'constellation': 'Orion'},
    {'name': 'Rigel', 'ra': 78.6345, 'dec': -8.2016, 'mag': 0.18, 'constellation': 'Orion'},
    {'name': 'Bellatrix', 'ra': 81.2827, 'dec': 6.3497, 'mag': 1.64, 'constellation': 'Orion'},
    {'name': 'Mintaka', 'ra': 83.0024, 'dec': -0.2991, 'mag': 2.25, 'constellation': 'Orion'},
    {'name': 'Alnilam', 'ra': 84.0534, 'dec': -1.2019, 'mag': 1.70, 'constellation': 'Orion'},
    {'name': 'Alnitak', 'ra': 85.1897, 'dec': -1.9426, 'mag': 1.77, 'constellation': 'Orion'},
    {'name': 'Saiph', 'ra': 86.9391, 'dec': -9.6696, 'mag': 2.07, 'constellation': 'Orion'},
    
    # Ursa Major (7 stars - Big Dipper)
    {'name': 'Dubhe', 'ra': 165.9310, 'dec': 61.7510, 'mag': 1.79, 'constellation': 'Ursa Major'},
    {'name': 'Merak', 'ra': 165.4603, 'dec': 56.3824, 'mag': 2.37, 'constellation': 'Ursa Major'},
    {'name': 'Phecda', 'ra': 178.4575, 'dec': 53.6948, 'mag': 2.44, 'constellation': 'Ursa Major'},
    {'name': 'Megrez', 'ra': 183.8565, 'dec': 57.0326, 'mag': 3.32, 'constellation': 'Ursa Major'},
    {'name': 'Alioth', 'ra': 193.5073, 'dec': 55.9598, 'mag': 1.76, 'constellation': 'Ursa Major'},
    {'name': 'Mizar', 'ra': 200.9814, 'dec': 54.9253, 'mag': 2.23, 'constellation': 'Ursa Major'},
    {'name': 'Alkaid', 'ra': 206.8852, 'dec': 49.3137, 'mag': 1.86, 'constellation': 'Ursa Major'},
    
    # Cassiopeia (5 stars - W shape)
    {'name': 'Schedar', 'ra': 10.1269, 'dec': 56.5373, 'mag': 2.24, 'constellation': 'Cassiopeia'},
    {'name': 'Caph', 'ra': 2.2945, 'dec': 59.1498, 'mag': 2.28, 'constellation': 'Cassiopeia'},
    {'name': 'Gamma Cas', 'ra': 14.1772, 'dec': 60.7167, 'mag': 2.47, 'constellation': 'Cassiopeia'},
    
    # Southern Hemisphere
    {'name': 'Sirius', 'ra': 101.2875, 'dec': -16.7161, 'mag': -1.46, 'constellation': 'Canis Major'},
    {'name': 'Canopus', 'ra': 95.9879, 'dec': -52.6957, 'mag': -0.74, 'constellation': 'Carina'},
    {'name': 'Alpha Centauri', 'ra': 219.9021, 'dec': -60.8340, 'mag': -0.29, 'constellation': 'Centaurus'},
    {'name': 'Achernar', 'ra': 24.4285, 'dec': -57.2368, 'mag': 0.45, 'constellation': 'Eridanus'},
    
    # Other bright stars
    {'name': 'Arcturus', 'ra': 213.9150, 'dec': 19.1825, 'mag': -0.05, 'constellation': 'Boötes'},
    {'name': 'Vega', 'ra': 279.2346, 'dec': 38.7837, 'mag': 0.03, 'constellation': 'Lyra'},
    {'name': 'Capella', 'ra': 79.1725, 'dec': 45.9981, 'mag': 0.08, 'constellation': 'Auriga'},
    {'name': 'Procyon', 'ra': 114.8254, 'dec': 5.2250, 'mag': 0.40, 'constellation': 'Canis Minor'},
    {'name': 'Altair', 'ra': 297.6956, 'dec': 8.8683, 'mag': 0.77, 'constellation': 'Aquila'},
]

# Constellation lines
CONSTELLATION_LINES = {
    'Orion': [(0, 2), (2, 3), (3, 4), (4, 5), (2, 6), (6, 1)],
    'Ursa Major': [(7, 8), (8, 9), (9, 10), (10, 11), (11, 12), (12, 13)],
    'Cassiopeia': [(14, 15), (15, 16)],
    'Canis Major': [(17,)],  # Sirius
}

def get_client_location():
    """Get client location from IP"""
    try:
        response = requests.get('http://ipinfo.io/json', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if 'loc' in data:
                lat, lng = map(float, data['loc'].split(','))
                city = data.get('city', 'Unknown')
                country = data.get('country', 'Unknown')
                return lat, lng, DEFAULT_ALT, f"{city}, {country}"
    except:
        pass
    
    return DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ALT, "Johannesburg, South Africa"

def get_planet_positions(lat, lng, alt):
    """Get current positions of planets (simplified)"""
    try:
        now = Time.now()
        location = EarthLocation(lat=lat*u.deg, lon=lng*u.deg, height=alt*u.m)
        
        planets_data = []
        
        # Get Sun position
        sun_coord = get_sun(now)
        sun_altaz = sun_coord.transform_to(AltAz(obstime=now, location=location))
        
        planets_data.append({
            'name': 'Sun',
            'type': 'star',
            'alt': float(sun_altaz.alt.deg),
            'az': float(sun_altaz.az.deg),
            'mag': -26.74,
            'info': PLANETS['sun']['info'],
            'color': PLANETS['sun']['color']
        })
        
        # Simplified positions for other planets (you can enhance this with proper ephemeris)
        planet_positions = {
            'Mercury': {'alt': 25, 'az': 120, 'mag': -0.2},
            'Venus': {'alt': 35, 'az': 150, 'mag': -4.2},
            'Mars': {'alt': 45, 'az': 180, 'mag': -0.5},
            'Jupiter': {'alt': 30, 'az': 210, 'mag': -1.9},
            'Saturn': {'alt': 25, 'az': 240, 'mag': 0.5},
            'Moon': {'alt': 60, 'az': 90, 'mag': -12.74}  # Simplified moon position
        }
        
        for planet_name, pos in planet_positions.items():
            if planet_name.lower() in PLANETS:
                planets_data.append({
                    'name': planet_name,
                    'type': 'planet' if planet_name != 'Moon' else 'moon',
                    'alt': pos['alt'],
                    'az': pos['az'], 
                    'mag': pos['mag'],
                    'info': PLANETS[planet_name.lower()]['info'],
                    'color': PLANETS[planet_name.lower()]['color']
                })
        
        return planets_data
        
    except Exception as e:
        app.logger.error(f"Planet position error: {e}")
        return []

def get_all_satellites(lat, lng, alt):
    """Get real-time satellite data"""
    url = f"https://api.n2yo.com/rest/v1/satellite/above/{lat}/{lng}/{alt}/{SEARCH_RADIUS}/{CATEGORY_ID}/&apiKey={N2YO_API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'above' in data:
                satellites = data['above'][:50]
                for sat in satellites:
                    sat['timestamp'] = datetime.utcnow().isoformat()
                    sat['type'] = 'satellite'
                    sat['color'] = '#00FF00'
                return satellites
        return []
    except:
        return []

def get_visible_stars(lat, lng, alt):
    """Get stars visible from current location"""
    try:
        now = Time.now()
        location = EarthLocation(lat=lat*u.deg, lon=lng*u.deg, height=alt*u.m)
        visible_stars = []
        
        for star in BRIGHT_STARS:
            coord = SkyCoord(ra=star['ra']*u.deg, dec=star['dec']*u.deg)
            altaz = coord.transform_to(AltAz(obstime=now, location=location))
            
            if altaz.alt.deg > 5:
                visible_stars.append({
                    'name': star['name'],
                    'mag': star['mag'],
                    'constellation': star['constellation'],
                    'alt': float(altaz.alt.deg),
                    'az': float(altaz.az.deg),
                    'ra': star['ra'],
                    'dec': star['dec'],
                    'type': 'star',
                    'color': '#FFFFFF'
                })
        
        return visible_stars
    except Exception as e:
        app.logger.error(f"Star calculation error: {e}")
        return []

def get_constellations_data(lat, lng, alt):
    """Get constellations with lines"""
    stars = get_visible_stars(lat, lng, alt)
    constellations_data = {}
    
    for star in stars:
        const_name = star['constellation']
        if const_name not in constellations_data:
            constellations_data[const_name] = {
                'stars': [], 
                'lines': [],
                'info': CONSTELLATION_INFO.get(const_name, {
                    'name': const_name,
                    'meaning': 'Unknown',
                    'mythology': 'No mythology information available.',
                    'stars': 0,
                    'brightest_star': 'Unknown',
                    'season': 'Unknown',
                    'area_sq_deg': 0
                }),
                'type': 'constellation'
            }
        constellations_data[const_name]['stars'].append(star)
    
    for const_name, line_indices in CONSTELLATION_LINES.items():
        if const_name in constellations_data:
            visible_star_names = [s['name'] for s in constellations_data[const_name]['stars']]
            
            for line_pair in line_indices:
                if len(line_pair) == 2:
                    star1_idx, star2_idx = line_pair
                    if star1_idx < len(BRIGHT_STARS) and star2_idx < len(BRIGHT_STARS):
                        star1_name = BRIGHT_STARS[star1_idx]['name']
                        star2_name = BRIGHT_STARS[star2_idx]['name']
                        
                        if star1_name in visible_star_names and star2_name in visible_star_names:
                            constellations_data[const_name]['lines'].append({
                                'from': star1_name,
                                'to': star2_name
                            })
    
    return constellations_data

def get_wikipedia_info(search_term):
    """Get Wikipedia information"""
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{search_term.replace(' ', '_')}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                'title': data.get('title', search_term),
                'extract': data.get('extract', 'No information available.'),
                'thumbnail': data.get('thumbnail', {}).get('source', ''),
                'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
            }
    except:
        pass
    
    return {
        'title': search_term,
        'extract': 'No Wikipedia information available.',
        'thumbnail': '',
        'url': ''
    }

def get_comments(object_name):
    """Get comments for an object"""
    conn = sqlite3.connect('space_comments.db')
    c = conn.cursor()
    c.execute('''
        SELECT id, user_name, comment, points, timestamp 
        FROM comments 
        WHERE object_name = ? 
        ORDER BY points DESC, timestamp DESC
        LIMIT 20
    ''', (object_name,))
    comments = c.fetchall()
    conn.close()
    
    return [{
        'id': row[0],
        'user_name': row[1],
        'comment': row[2],
        'points': row[3],
        'timestamp': row[4]
    } for row in comments]

def add_comment(object_name, object_type, user_name, comment):
    """Add a new comment"""
    conn = sqlite3.connect('space_comments.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO comments (object_name, object_type, user_name, comment)
        VALUES (?, ?, ?, ?)
    ''', (object_name, object_type, user_name, comment))
    conn.commit()
    conn.close()
    return True

def vote_comment(comment_id, increment=True):
    """Vote on a comment"""
    conn = sqlite3.connect('space_comments.db')
    c = conn.cursor()
    if increment:
        c.execute('UPDATE comments SET points = points + 1 WHERE id = ?', (comment_id,))
    else:
        c.execute('UPDATE comments SET points = points - 1 WHERE id = ?', (comment_id,))
    conn.commit()
    conn.close()
    return True

@app.route('/')
def index():
    lat, lng, alt, location_name = get_client_location()
    return render_template('index.html', lat=lat, lng=lng, location_name=location_name)

@app.route('/get_satellites')
def get_satellites_route():
    lat = request.args.get('lat', default=DEFAULT_LAT, type=float)
    lng = request.args.get('lng', default=DEFAULT_LNG, type=float)
    alt = request.args.get('alt', default=DEFAULT_ALT, type=float)
    
    satellites = get_all_satellites(lat, lng, alt)
    return jsonify(satellites)

@app.route('/get_constellations')
def get_constellations_route():
    lat = request.args.get('lat', default=DEFAULT_LAT, type=float)
    lng = request.args.get('lng', default=DEFAULT_LNG, type=float)
    alt = request.args.get('alt', default=DEFAULT_ALT, type=float)
    
    constellations = get_constellations_data(lat, lng, alt)
    return jsonify(constellations)

@app.route('/get_planets')
def get_planets_route():
    lat = request.args.get('lat', default=DEFAULT_LAT, type=float)
    lng = request.args.get('lng', default=DEFAULT_LNG, type=float)
    alt = request.args.get('alt', default=DEFAULT_ALT, type=float)
    
    planets = get_planet_positions(lat, lng, alt)
    return jsonify(planets)

@app.route('/get_location')
def get_location_route():
    lat, lng, alt, location_name = get_client_location()
    return jsonify({
        'lat': lat,
        'lng': lng,
        'alt': alt,
        'name': location_name
    })

@app.route('/get_info/<item_type>/<item_name>')
def get_info_route(item_type, item_name):
    if item_type == 'star':
        info = get_wikipedia_info(item_name)
    elif item_type == 'constellation':
        const_info = CONSTELLATION_INFO.get(item_name)
        if const_info:
            info = {
                'title': f"Constellation {item_name}",
                'extract': f"{const_info['meaning']}\n\nMythology: {const_info['mythology']}\n\nBrightest Star: {const_info['brightest_star']}\nNumber of Main Stars: {const_info['stars']}\nBest Viewing Season: {const_info['season']}\nArea: {const_info['area_sq_deg']} square degrees",
                'thumbnail': '',
                'url': ''
            }
        else:
            info = get_wikipedia_info(item_name)
    elif item_type == 'planet' or item_type == 'moon':
        planet_info = PLANETS.get(item_name.lower())
        if planet_info:
            info = {
                'title': planet_info['name'],
                'extract': planet_info['info'],
                'thumbnail': '',
                'url': ''
            }
        else:
            info = get_wikipedia_info(item_name)
    else:
        info = get_wikipedia_info(item_name)
    
    return jsonify(info)

@app.route('/get_comments/<object_name>')
def get_comments_route(object_name):
    comments = get_comments(object_name)
    return jsonify(comments)

@app.route('/add_comment', methods=['POST'])
def add_comment_route():
    data = request.json
    success = add_comment(
        data['object_name'],
        data['object_type'], 
        data['user_name'],
        data['comment']
    )
    return jsonify({'success': success})

@app.route('/vote_comment/<int:comment_id>/<action>')
def vote_comment_route(comment_id, action):
    success = vote_comment(comment_id, action == 'upvote')
    return jsonify({'success': success})

if __name__ == "__main__":
    app.run(debug=True, host='localhost', port=5000)
