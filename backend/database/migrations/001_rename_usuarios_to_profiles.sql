-- Migration: Rename usuarios table to profiles and adjust column names
-- This migration aligns the database schema with the backend code expectations

BEGIN;

-- Rename the usuarios table to profiles
ALTER TABLE usuarios RENAME TO profiles;

-- Rename columns to match backend expectations
ALTER TABLE profiles RENAME COLUMN senha TO senha_hash;
ALTER TABLE profiles RENAME COLUMN ultimo_acesso TO ultimo_login;
ALTER TABLE profiles RENAME COLUMN avatar TO avatar_url;

-- Update indexes that reference the old table name
DROP INDEX IF EXISTS idx_usuarios_email;
DROP INDEX IF EXISTS idx_usuarios_tipo;

-- Recreate indexes with new table name
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_tipo ON profiles(tipo);

-- Update foreign key references in other tables
-- Update produtos table foreign key
ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_cadastrado_por_fkey;
ALTER TABLE produtos ADD CONSTRAINT produtos_cadastrado_por_fkey 
    FOREIGN KEY (cadastrado_por) REFERENCES profiles(id);

-- Update vendas table foreign key
ALTER TABLE vendas DROP CONSTRAINT IF EXISTS vendas_vendedor_id_fkey;
ALTER TABLE vendas ADD CONSTRAINT vendas_vendedor_id_fkey 
    FOREIGN KEY (vendedor_id) REFERENCES profiles(id);

-- Update movimentacoes_estoque table foreign key
ALTER TABLE movimentacoes_estoque DROP CONSTRAINT IF EXISTS movimentacoes_estoque_usuario_id_fkey;
ALTER TABLE movimentacoes_estoque ADD CONSTRAINT movimentacoes_estoque_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES profiles(id);

-- Update logs_sistema table foreign key
ALTER TABLE logs_sistema DROP CONSTRAINT IF EXISTS logs_sistema_usuario_id_fkey;
ALTER TABLE logs_sistema ADD CONSTRAINT logs_sistema_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES profiles(id);

-- Update logs_sistema index
DROP INDEX IF EXISTS idx_logs_usuario;
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);

COMMIT;