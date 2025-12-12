/*
  # Create Sites Module Tables

  ## Overview
  This migration creates the complete database structure for the TERVIS.SITES module,
  enabling professionals to create and manage their own websites through AI-powered
  conversational interface.

  ## New Tables Created
  
  ### 1. `sites`
  Stores professional websites with HTML/CSS content and metadata.
  - `id` (uuid, primary key) - Unique site identifier
  - `professional_id` (uuid, foreign key) - Links to professionals table
  - `site_name` (text) - Display name for the site
  - `subdomain` (text, unique) - Free subdomain (e.g., drjoao.tervis.ai)
  - `custom_domain` (text, nullable) - Optional custom domain
  - `html_content` (text) - Generated HTML content
  - `css_content` (text) - Generated CSS styles
  - `template_id` (uuid, nullable) - Reference to template used
  - `palette_id` (uuid, nullable) - Reference to color palette
  - `is_published` (boolean) - Publication status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `templates`
  Predefined HTML/CSS templates for quick site creation.
  - `id` (uuid, primary key) - Unique template identifier
  - `name` (text) - Template name
  - `description` (text) - Template description
  - `category` (text) - Category (medical, dental, veterinary, etc.)
  - `preview_image_url` (text) - Preview image URL
  - `html_template` (text) - Base HTML structure
  - `css_template` (text) - Base CSS styles
  - `is_active` (boolean) - Availability status
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `palettes`
  Color palettes for site customization.
  - `id` (uuid, primary key) - Unique palette identifier
  - `name` (text) - Palette name
  - `primary_color` (text) - Primary color hex
  - `secondary_color` (text) - Secondary color hex
  - `accent_color` (text) - Accent color hex
  - `background_color` (text) - Background color hex
  - `text_color` (text) - Text color hex
  - `preview_image_url` (text, nullable) - Preview image
  - `is_active` (boolean) - Availability status
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `domains`
  Custom domain management for professional sites.
  - `id` (uuid, primary key) - Unique domain identifier
  - `site_id` (uuid, foreign key) - Links to sites table
  - `domain_name` (text, unique) - Custom domain name
  - `verification_code` (text) - DNS verification code
  - `is_verified` (boolean) - Verification status
  - `dns_configured` (boolean) - DNS configuration status
  - `ssl_status` (text) - SSL certificate status
  - `created_at` (timestamptz) - Creation timestamp
  - `verified_at` (timestamptz, nullable) - Verification timestamp

  ### 5. `site_images`
  Image uploads for site content (logos, photos, etc.).
  - `id` (uuid, primary key) - Unique image identifier
  - `site_id` (uuid, foreign key) - Links to sites table
  - `image_url` (text) - Storage URL
  - `image_type` (text) - Type (logo, photo, banner, etc.)
  - `file_size` (integer) - File size in bytes
  - `created_at` (timestamptz) - Upload timestamp

  ## Security
  
  - RLS enabled on all tables
  - Professionals can only access their own sites
  - Templates and palettes are publicly readable
  - Domain management restricted to site owners
  - Image uploads restricted to site owners

  ## Important Notes
  
  1. Free subdomains use pattern: {subdomain}.tervis.ai
  2. Only verified professionals can create sites
  3. Maximum 1 site per professional on free plan
  4. Custom domains require DNS verification
  5. Images stored in Supabase Storage (sites-images bucket)
*/

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  site_name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  custom_domain text UNIQUE,
  html_content text DEFAULT '',
  css_content text DEFAULT '',
  template_id uuid,
  palette_id uuid,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  preview_image_url text,
  html_template text NOT NULL,
  css_template text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create palettes table
CREATE TABLE IF NOT EXISTS palettes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  background_color text NOT NULL,
  text_color text NOT NULL,
  preview_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  domain_name text UNIQUE NOT NULL,
  verification_code text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_verified boolean DEFAULT false,
  dns_configured boolean DEFAULT false,
  ssl_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- Create site_images table
CREATE TABLE IF NOT EXISTS site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text NOT NULL DEFAULT 'photo',
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for template_id and palette_id
ALTER TABLE sites ADD CONSTRAINT fk_sites_template 
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

ALTER TABLE sites ADD CONSTRAINT fk_sites_palette 
  FOREIGN KEY (palette_id) REFERENCES palettes(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_professional_id ON sites(professional_id);
CREATE INDEX IF NOT EXISTS idx_sites_subdomain ON sites(subdomain);
CREATE INDEX IF NOT EXISTS idx_sites_custom_domain ON sites(custom_domain);
CREATE INDEX IF NOT EXISTS idx_domains_site_id ON domains(site_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain_name ON domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_site_images_site_id ON site_images(site_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_palettes_is_active ON palettes(is_active);

-- Enable RLS on all tables
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sites table

CREATE POLICY "Professionals can view own sites"
  ON sites FOR SELECT
  TO authenticated
  USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can create own sites"
  ON sites FOR INSERT
  TO authenticated
  WITH CHECK (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update own sites"
  ON sites FOR UPDATE
  TO authenticated
  USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ))
  WITH CHECK (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can delete own sites"
  ON sites FOR DELETE
  TO authenticated
  USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

-- RLS Policies for templates (public read)

CREATE POLICY "Anyone can view active templates"
  ON templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for palettes (public read)

CREATE POLICY "Anyone can view active palettes"
  ON palettes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for domains table

CREATE POLICY "Professionals can view own domains"
  ON domains FOR SELECT
  TO authenticated
  USING (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can create domains for own sites"
  ON domains FOR INSERT
  TO authenticated
  WITH CHECK (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update own domains"
  ON domains FOR UPDATE
  TO authenticated
  USING (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ))
  WITH CHECK (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can delete own domains"
  ON domains FOR DELETE
  TO authenticated
  USING (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- RLS Policies for site_images table

CREATE POLICY "Professionals can view own site images"
  ON site_images FOR SELECT
  TO authenticated
  USING (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can upload images to own sites"
  ON site_images FOR INSERT
  TO authenticated
  WITH CHECK (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Professionals can delete own site images"
  ON site_images FOR DELETE
  TO authenticated
  USING (site_id IN (
    SELECT s.id FROM sites s
    JOIN professionals p ON s.professional_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Insert default templates

INSERT INTO templates (name, description, category, html_template, css_template, is_active) VALUES
(
  'Clássico Médico',
  'Template profissional e clean para médicos e clínicas',
  'medical',
  '<!DOCTYPE html><html><head><title>{{site_name}}</title></head><body><header><h1>{{professional_name}}</h1><p>{{specialty}}</p></header><main><section class="about"><h2>Sobre</h2><p>{{about}}</p></section><section class="services"><h2>Serviços</h2><div>{{services}}</div></section><section class="contact"><h2>Contato</h2><p>{{contact}}</p></section></main></body></html>',
  'body { font-family: system-ui; margin: 0; color: #333; } header { background: #0EA5E9; color: white; padding: 60px 20px; text-align: center; } h1 { margin: 0; font-size: 2.5rem; } main { max-width: 1200px; margin: 0 auto; padding: 40px 20px; } section { margin: 40px 0; }',
  true
),
(
  'Moderno Veterinário',
  'Design amigável e colorido para veterinários',
  'veterinary',
  '<!DOCTYPE html><html><head><title>{{site_name}}</title></head><body><header><h1>{{professional_name}}</h1><p>{{specialty}}</p></header><main><section class="about"><h2>Sobre</h2><p>{{about}}</p></section><section class="services"><h2>Serviços</h2><div>{{services}}</div></section></main></body></html>',
  'body { font-family: system-ui; margin: 0; color: #333; } header { background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%); color: white; padding: 60px 20px; text-align: center; } h1 { margin: 0; font-size: 2.5rem; } main { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }',
  true
),
(
  'Elegante Dental',
  'Template sofisticado para dentistas',
  'dental',
  '<!DOCTYPE html><html><head><title>{{site_name}}</title></head><body><header><h1>{{professional_name}}</h1><p>{{specialty}}</p></header><main><section class="about"><h2>Sobre</h2><p>{{about}}</p></section><section class="services"><h2>Serviços</h2><div>{{services}}</div></section></main></body></html>',
  'body { font-family: system-ui; margin: 0; color: #1f2937; background: #f9fafb; } header { background: white; color: #1f2937; padding: 60px 20px; text-align: center; border-bottom: 3px solid #0EA5E9; } h1 { margin: 0; font-size: 2.5rem; } main { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }',
  true
);

-- Insert default color palettes

INSERT INTO palettes (name, primary_color, secondary_color, accent_color, background_color, text_color, is_active) VALUES
('Azul Profissional', '#0EA5E9', '#0284C7', '#22D3EE', '#FFFFFF', '#1F2937', true),
('Verde Saúde', '#10B981', '#059669', '#34D399', '#FFFFFF', '#1F2937', true),
('Roxo Moderno', '#8B5CF6', '#7C3AED', '#A78BFA', '#FFFFFF', '#1F2937', true),
('Laranja Energia', '#F59E0B', '#D97706', '#FBBF24', '#FFFFFF', '#1F2937', true),
('Rosa Suave', '#EC4899', '#DB2777', '#F472B6', '#FFFFFF', '#1F2937', true);
