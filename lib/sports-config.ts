import { SportCategory } from './types';

export interface SportConfig {
  emoji: string;
  color: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
}

export const SPORT_CONFIG: Record<SportCategory, SportConfig> = {
  NBA: {
    emoji: '🏀',
    color: '#C9082A',
    accentColor: 'rgb(201, 8, 42)',
    bgColor: 'rgba(201, 8, 42, 0.15)',
    textColor: '#ff6b7a',
  },
  NFL: {
    emoji: '🏈',
    color: '#013369',
    accentColor: 'rgb(1, 51, 105)',
    bgColor: 'rgba(1, 51, 105, 0.2)',
    textColor: '#6b9fff',
  },
  MLB: {
    emoji: '⚾',
    color: '#002D72',
    accentColor: 'rgb(0, 45, 114)',
    bgColor: 'rgba(0, 45, 114, 0.2)',
    textColor: '#7ab3ff',
  },
  NHL: {
    emoji: '🏒',
    color: '#000000',
    accentColor: 'rgb(0, 100, 200)',
    bgColor: 'rgba(0, 100, 200, 0.15)',
    textColor: '#5ab4ff',
  },
  Soccer: {
    emoji: '⚽',
    color: '#1a7a1a',
    accentColor: 'rgb(26, 122, 26)',
    bgColor: 'rgba(26, 122, 26, 0.15)',
    textColor: '#6fcf6f',
  },
  Tennis: {
    emoji: '🎾',
    color: '#c8a900',
    accentColor: 'rgb(200, 169, 0)',
    bgColor: 'rgba(200, 169, 0, 0.15)',
    textColor: '#f5d800',
  },
  Golf: {
    emoji: '⛳',
    color: '#2d6a2d',
    accentColor: 'rgb(45, 106, 45)',
    bgColor: 'rgba(45, 106, 45, 0.15)',
    textColor: '#78c878',
  },
  'MMA/UFC': {
    emoji: '🥊',
    color: '#cc0000',
    accentColor: 'rgb(204, 0, 0)',
    bgColor: 'rgba(204, 0, 0, 0.15)',
    textColor: '#ff6666',
  },
  'College Basketball': {
    emoji: '🏀',
    color: '#ff6b00',
    accentColor: 'rgb(255, 107, 0)',
    bgColor: 'rgba(255, 107, 0, 0.15)',
    textColor: '#ff9a50',
  },
  'College Football': {
    emoji: '🏈',
    color: '#8B4513',
    accentColor: 'rgb(139, 69, 19)',
    bgColor: 'rgba(139, 69, 19, 0.2)',
    textColor: '#c8956a',
  },
  NASCAR: {
    emoji: '🏎️',
    color: '#ff6600',
    accentColor: 'rgb(255, 102, 0)',
    bgColor: 'rgba(255, 102, 0, 0.15)',
    textColor: '#ff9955',
  },
  F1: {
    emoji: '🏎️',
    color: '#e10600',
    accentColor: 'rgb(225, 6, 0)',
    bgColor: 'rgba(225, 6, 0, 0.15)',
    textColor: '#ff6b6b',
  },
  Boxing: {
    emoji: '🥊',
    color: '#8b0000',
    accentColor: 'rgb(139, 0, 0)',
    bgColor: 'rgba(139, 0, 0, 0.15)',
    textColor: '#ff5555',
  },
  WNBA: {
    emoji: '🏀',
    color: '#ff6900',
    accentColor: 'rgb(255, 105, 0)',
    bgColor: 'rgba(255, 105, 0, 0.15)',
    textColor: '#ffb37a',
  },
  'International Basketball': {
    emoji: '🏀',
    color: '#00838F',
    accentColor: 'rgb(0, 131, 143)',
    bgColor: 'rgba(0, 131, 143, 0.15)',
    textColor: '#4dd0e1',
  },
  'Horse Racing': {
    emoji: '🏇',
    color: '#a16207',
    accentColor: 'rgb(161, 98, 7)',
    bgColor: 'rgba(161, 98, 7, 0.15)',
    textColor: '#fbbf24',
  },
  Other: {
    emoji: '🏅',
    color: '#666666',
    accentColor: 'rgb(102, 102, 102)',
    bgColor: 'rgba(102, 102, 102, 0.15)',
    textColor: '#aaaaaa',
  },
};

export const SPORT_ORDER: SportCategory[] = [
  'NBA',
  'NFL',
  'MLB',
  'NHL',
  'College Basketball',
  'College Football',
  'Soccer',
  'Tennis',
  'Golf',
  'MMA/UFC',
  'NASCAR',
  'F1',
  'Boxing',
  'WNBA',
  'International Basketball',
  'Horse Racing',
  'Other',
];
