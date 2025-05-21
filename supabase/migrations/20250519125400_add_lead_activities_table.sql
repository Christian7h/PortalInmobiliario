-- Crear tabla de actividades de leads para trackear eventos y notificaciones
create table if not exists "public"."lead_activities" (
    "id" uuid not null default gen_random_uuid(),
    "lead_id" uuid not null,
    "activity_type" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    
    primary key ("id"),
    foreign key ("lead_id") references "public"."leads"("id") on delete cascade
);

-- Establecer permisos
alter table "public"."lead_activities" enable row level security;

-- Crear políticas de seguridad: solo los propietarios pueden ver y modificar
create policy "Los administradores pueden ver todas las actividades" 
    on "public"."lead_activities" for select 
    using (auth.role() = 'authenticated');

create policy "Los administradores pueden insertar actividades" 
    on "public"."lead_activities" for insert 
    with check (auth.role() = 'authenticated');

-- Permitir el acceso al servicio
grant all on "public"."lead_activities" to anon, authenticated, service_role;
