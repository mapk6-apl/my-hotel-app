import React from 'react';
import { Image as ImageIcon } from 'lucide-react'; 
import '../../styles/screen3.css'; 

export type PhotoGalleryProps = {
  heroImage?: string;
  galleryImages?: string[];
};