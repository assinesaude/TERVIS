/*
  # Remover Índices Não Utilizados - Otimização de Segurança e Performance

  1. Remoção de Índices
    - Remove todos os índices não utilizados para melhorar performance de write
    - Reduz overhead de manutenção
    - Libera espaço em disco
  
  2. Impacto
    - Melhora performance de INSERT/UPDATE/DELETE
    - Reduz uso de espaço
    - Mantém apenas índices essenciais (PKs, FKs, constraints)
*/

-- Remover índices de appointments
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_appointments_professional;
DROP INDEX IF EXISTS idx_appointments_patient;
DROP INDEX IF EXISTS idx_appointments_service_id;

-- Remover índices de chat_messages
DROP INDEX IF EXISTS idx_chat_messages_user;
DROP INDEX IF EXISTS idx_chat_messages_session;

-- Remover índices de service_regions
DROP INDEX IF EXISTS idx_service_regions_professional;
DROP INDEX IF EXISTS idx_service_regions_location;

-- Remover índices de audit_logs
DROP INDEX IF EXISTS idx_audit_logs_user;
DROP INDEX IF EXISTS idx_audit_logs_created;

-- Remover índices de professionals
DROP INDEX IF EXISTS idx_professionals_priority_level;
DROP INDEX IF EXISTS idx_professionals_city;
DROP INDEX IF EXISTS idx_professionals_specialty;
DROP INDEX IF EXISTS idx_professionals_subscription_plan;

-- Remover índices de premium_exclusive_neighborhoods
DROP INDEX IF EXISTS idx_premium_neighborhoods_specialty_city;
DROP INDEX IF EXISTS idx_premium_neighborhoods_professional;

-- Remover índices de professional documents, schedules, services
DROP INDEX IF EXISTS idx_professional_documents_professional_id;
DROP INDEX IF EXISTS idx_professional_schedules_professional_id;
DROP INDEX IF EXISTS idx_professional_services_professional_id;

-- Remover índices de professional_pending_verification
DROP INDEX IF EXISTS idx_professional_pending_user_id;
DROP INDEX IF EXISTS idx_professional_pending_status;

-- Remover índices de token_usage_logs
DROP INDEX IF EXISTS idx_token_usage_logs_user_date;
DROP INDEX IF EXISTS idx_token_usage_logs_category;

-- Remover índices de sites e relacionados
DROP INDEX IF EXISTS idx_sites_professional_id;
DROP INDEX IF EXISTS idx_sites_subdomain;
DROP INDEX IF EXISTS idx_sites_custom_domain;
DROP INDEX IF EXISTS idx_sites_palette_id;
DROP INDEX IF EXISTS idx_sites_template_id;

-- Remover índices de domains
DROP INDEX IF EXISTS idx_domains_site_id;
DROP INDEX IF EXISTS idx_domains_domain_name;

-- Remover índices de site_images
DROP INDEX IF EXISTS idx_site_images_site_id;

-- Remover índices de templates e palettes
DROP INDEX IF EXISTS idx_templates_category;
DROP INDEX IF EXISTS idx_templates_is_active;
DROP INDEX IF EXISTS idx_palettes_is_active;
