import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import PainterCard from '../components/PainterCard';
import type { PainterListing, SiteConfig } from '../types';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { PainterCardSkeleton } from '../components/Skeleton';
import { useTranslation } from '../lib/translations';

const ALL_CITIES = [
  'Yaounde', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundere',
  'Buea', 'Limbe', 'Kumba', 'Tiko', 'Mutengene', 'Bota', 'Muea',
  'Kribi', 'Edea', 'Ebolowa', 'Sangmelima', 'Mbalmayo', 'Bertoua',
  'Dschang', 'Foumban', 'Kumbo', 'Mbouda', 'Bafang', 'Bafia',
  'Nkongsamba', 'Loum', 'Manjo', 'Penja', 'Yabassi',
  'Kousseri', 'Mokolo', 'Yagoua', 'Mora', 'Kaélé',
  'Meiganga', 'Tibati', 'Tignère', 'Banyo',
  'Wum', 'Nkambe', 'Fundong', 'Mbengwi',
  'Kye-Ossi', 'Ambam', 'Olamze',
  'Mamfe', 'Ekok', 'Akwaya',
  'Akonolinga', 'Abong-Mbang', 'Doume',
];

export default function Painters() {
  const { t } = useTranslation();
  const [painters, setPainters] = useState<PainterListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'config', 'regions-specialties'));
        if (configDoc.exists()) {
          const data = configDoc.data() as SiteConfig;
          setAllRegions(data.regions || []);
          setAllSpecialties(data.specialties || []);
        }
      } catch {
        setAllRegions(['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'North West', 'South', 'South West', 'West']);
        setAllSpecialties(['Interior', 'Exterior', 'Decorative', 'Commercial', 'Residential', 'Industrial']);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const fetchPainters = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'listings'), where('visible', '==', true));
        if (selectedRegion) {
          q = query(q, where('regions', 'array-contains', selectedRegion));
        }
        if (selectedCity) {
          q = query(q, where('cities', 'array-contains', selectedCity));
        }
        if (selectedSpecialty) {
          q = query(q, where('specialties', 'array-contains', selectedSpecialty));
        }
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as PainterListing));
        setPainters(list);
      } catch (err) {
        console.log('Firebase error', err);
      }
      setLoading(false);
    };
    fetchPainters();
  }, [selectedRegion, selectedCity, selectedSpecialty]);

  const filtered = painters.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.businessName?.toLowerCase().includes(q) ||
      p.cities?.some(c => c.toLowerCase().includes(q)) ||
      p.regions?.some(r => r.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-white"
        style={{ fontFamily: 'Inter' }}
      >
        {t('directory.title')}
      </motion.h1>

      <div className="glass p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field has-icon"
            />
          </div>

          <div className="relative">
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="input-field"
              style={{ color: selectedRegion ? '#FFFFFF' : '#C5C8CE' }}
            >
              <option value="" style={{ color: '#C5C8CE', background: '#17181C' }}>{t('search.allRegions')}</option>
              {allRegions.map(r => (
                <option key={r} value={r} style={{ color: '#FFFFFF', background: '#17181C' }}>{r}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="input-field"
              style={{ color: selectedCity ? '#FFFFFF' : '#C5C8CE' }}
            >
              <option value="" style={{ color: '#C5C8CE', background: '#17181C' }}>All Cities</option>
              {ALL_CITIES.sort().map(c => (
                <option key={c} value={c} style={{ color: '#FFFFFF', background: '#17181C' }}>{c}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="input-field"
              style={{ color: selectedSpecialty ? '#FFFFFF' : '#C5C8CE' }}
            >
              <option value="" style={{ color: '#C5C8CE', background: '#17181C' }}>{t('search.allSpecialties')}</option>
              {allSpecialties.map(s => (
                <option key={s} value={s} style={{ color: '#FFFFFF', background: '#17181C' }}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <PainterCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <FaFilter className="text-4xl mx-auto mb-4 text-text-muted/30" />
          <p className="text-lg font-semibold mb-2 text-text" style={{ fontFamily: 'Inter' }}>{t('search.noResults')}</p>
          <p className="text-text-muted/70">{t('search.noResults.desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <PainterCard key={p.id} painter={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
