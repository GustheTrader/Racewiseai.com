-- Add admin role to jeffgus@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('c23084d4-4ae4-47dc-b96e-ea0ab9bfc53c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;