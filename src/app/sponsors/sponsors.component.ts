import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Sponsor {
  name: string;
  category: 'institutionnel' | 'officiel' | 'media';
  categoryLabel: string;
  logoText: string;
  description: string;
  bgColor: string;
  textColor: string;
  heightClass: 'short' | 'medium' | 'tall'; // For Masonry heights
}

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sponsors.component.html',
  styleUrl: './sponsors.component.scss',
})
export class SponsorsComponent {
  public sponsors: Sponsor[] = [
    {
      name: 'Ministère de la Culture, des Arts et du Tourisme',
      category: 'institutionnel',
      categoryLabel: 'Partenaire Institutionnel',
      logoText: 'MCAT',
      description: 'Garant de la promotion du patrimoine culturel et artistique de la République du Congo.',
      bgColor: '#009543',
      textColor: '#ffffff',
      heightClass: 'tall',
    },
    {
      name: 'MTN Congo',
      category: 'officiel',
      categoryLabel: 'Partenaire Officiel',
      logoText: 'MTN',
      description: 'Premier opérateur de télécommunications au Congo, accompagnant la connectivité des festivités.',
      bgColor: '#ffcc00',
      textColor: '#000000',
      heightClass: 'medium',
    },
    {
      name: 'Société Nationale des Pétroles du Congo (SNPC)',
      category: 'officiel',
      categoryLabel: 'Partenaire Officiel',
      logoText: 'SNPC',
      description: 'Acteur majeur du développement énergétique et économique du bassin congolais.',
      bgColor: '#0f2b1a',
      textColor: '#ffffff',
      heightClass: 'tall',
    },
    {
      name: 'Canal+ Congo',
      category: 'media',
      categoryLabel: 'Partenaire Média',
      logoText: 'CANAL+',
      description: 'Diffuseur officiel pour faire rayonner la culture congolaise à travers le continent.',
      bgColor: '#000000',
      textColor: '#ffffff',
      heightClass: 'short',
    },
    {
      name: 'Congo Telecom',
      category: 'officiel',
      categoryLabel: 'Partenaire Officiel',
      logoText: 'CT',
      description: 'Opérateur historique fournissant les infrastructures réseau haut débit de l\'événement.',
      bgColor: '#0056b3',
      textColor: '#ffffff',
      heightClass: 'medium',
    },
    {
      name: 'Télé Congo',
      category: 'media',
      categoryLabel: 'Partenaire Média',
      logoText: 'Télé Congo',
      description: 'La chaîne de télévision nationale qui assure la retransmission en direct des grands moments du 15 Août.',
      bgColor: '#d52b1e',
      textColor: '#ffffff',
      heightClass: 'medium',
    },
    {
      name: 'Banque Commerciale Internationale (BCI)',
      category: 'officiel',
      categoryLabel: 'Partenaire Officiel',
      logoText: 'BCI',
      description: 'Institution financière clé facilitant le développement et l\'inclusion financière au Congo.',
      bgColor: '#f8f9fa',
      textColor: '#1a1a3e',
      heightClass: 'short',
    },
    {
      name: 'Port Autonome de Pointe-Noire',
      category: 'institutionnel',
      categoryLabel: 'Partenaire Institutionnel',
      logoText: 'PAPN',
      description: 'Le poumon économique de la sous-région, soutenant les initiatives citoyennes.',
      bgColor: '#17a2b8',
      textColor: '#ffffff',
      heightClass: 'tall',
    },
    {
      name: 'Airtel Congo',
      category: 'officiel',
      categoryLabel: 'Partenaire Officiel',
      logoText: 'airtel',
      description: 'Réseau mobile innovant au service des jeunes et de l\'entrepreneuriat au Congo.',
      bgColor: '#e3120b',
      textColor: '#ffffff',
      heightClass: 'medium',
    },
    {
      name: 'Vox Congo',
      category: 'media',
      categoryLabel: 'Partenaire Média',
      logoText: 'VOX',
      description: 'Média d\'information et de décryptage au cœur de l\'actualité et de la culture congolaise.',
      bgColor: '#343a40',
      textColor: '#ffde00',
      heightClass: 'short',
    },
    {
      name: 'Brasco',
      category: 'officiel',
      categoryLabel: 'Partenaire Officiel',
      logoText: 'Brasco',
      description: 'Partenaire historique des moments de partage et de convivialité lors des fêtes nationales.',
      bgColor: '#28a745',
      textColor: '#ffffff',
      heightClass: 'medium',
    }
  ];
}
