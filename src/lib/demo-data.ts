import type { AppUser } from '../types';

const NOW = Date.now();
const DAY = 86400000;

export const DEMO_ADMIN: AppUser = {
  uid: 'demo-admin',
  email: 'justus@magictouch.cm',
  displayName: 'Justus',
  photoURL: '',
  role: 'admin',
  accountStatus: 'active',
  createdAt: NOW,
};

export const DEMO_PAINTER: AppUser = {
  uid: 'demo-painter-1',
  email: 'john@example.com',
  displayName: 'John Nkwi',
  photoURL: '',
  role: 'painter',
  accountStatus: 'active',
  couponId: 'DEMO-001',
  expiresAt: NOW + 30 * DAY,
  createdAt: NOW,
  profile: {
    name: 'John Nkwi',
    businessName: 'Nkwi Painting Pro',
    bio: 'Professional painter with over 8 years of experience in residential and commercial painting across Cameroon. Specializing in interior and exterior finishes.',
    yearsOfExperience: 8,
    photoUrl: '',
    coverImageUrl: '',
    whatsappNumber: '237671234567',
    phoneNumber: '237671234567',
    email: 'john@example.com',
    serviceAreas: ['Yaounde', 'Douala'],
    regions: ['Centre', 'Littoral'],
    cities: ['Yaounde', 'Douala'],
    specialties: ['Interior', 'Exterior', 'Residential'],
    availability: true,
    workingHours: 'Mon-Sat 7AM-6PM',
  },
};
