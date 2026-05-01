import { Pipe, PipeTransform } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';


// --- IMPORTS SÉLECTIFS (Tree Shaking Friendly) ---
import {
  // Flèches & Navigation
  faArrowRight,
  faArrowLeft,
  faAngleDown,
  faAngleRight,
  faAngleLeft,
  faAngleUp,
  faChevronRight,

  // Contact & Social
  faEnvelope,
  faPhone,
  faLocationDot,


  // Services (Bento Grid)
  faCode,                // Web Dev
  faMobileScreenButton,  // Mobile Dev
  faPenNib,              // UI/UX Design
  faBezierCurve,         // Logo / Branding
  faRocket,              // Performance / Growth
  faShieldHalved,        // Sécurité
  faLayerGroup,          // Architecture
  faQuoteLeft,

  // Actions
  faCheck,
  faXmark,
  faSearch,
  faPlay
} from '@fortawesome/free-solid-svg-icons';

import {
  // Marques (Footer / Réseaux)
  faLinkedin,
  faTwitter,
  faInstagram,
  faGithub,
  faAngular,
  faNodeJs,
  faReact,
  faApple,
  faGooglePlay
} from '@fortawesome/free-brands-svg-icons';

// --- MAPPING OPTIMISÉ (O(1) Access) ---
const ICONS_MAP: Record<string, IconProp> = {
  // --- Navigation ---
  'faAngleRight': faAngleRight,
  'faAngleLeft': faAngleLeft,
  'faArrowRight': faArrowRight,
  'faArrowLeft': faArrowLeft,
  'faAngleDown': faAngleDown,
  'faAngleUp': faAngleUp,
  'faChevronRight': faChevronRight,

  // --- Contact ---
  'faEnvelope': faEnvelope,
  'faPhone': faPhone,
  'faLocationDot': faLocationDot,
  'faQuoteLeft': faQuoteLeft,

  // --- Services ---
  'faCode': faCode,
  'faMobileScreenButton': faMobileScreenButton,
  'faPenNib': faPenNib,
  'faBezierCurve': faBezierCurve,
  'faRocket': faRocket,
  'faShieldHalved': faShieldHalved,
  'faLayerGroup': faLayerGroup,

  // --- Actions ---
  'faCheck': faCheck,
  'faXmark': faXmark,
  'faSearch': faSearch,
  'faPlay': faPlay,

  // --- Brands ---
  'faLinkedin': faLinkedin,
  'faTwitter': faTwitter,
  'faInstagram': faInstagram,
  'faGithub': faGithub,
  'faAngular': faAngular,
  'faNodeJs': faNodeJs,
  'faReact': faReact,
  'faApple': faApple,
  'faGooglePlay': faGooglePlay
};

@Pipe({
  name: 'toFaIcon'
})

export class ToFaIconPipe implements PipeTransform {
  transform(value: string): IconProp {
    return ICONS_MAP[value] || faCode;
  }
}
