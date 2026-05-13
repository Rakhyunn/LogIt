-- covers 버킷 생성 (public: 이미지 URL 직접 접근 가능)
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 누구나 읽기 가능
CREATE POLICY "covers_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- 인증 유저만 업로드
CREATE POLICY "covers_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND auth.role() = 'authenticated'
  );

-- 본인이 업로드한 파일만 삭제 (경로: covers/{user_id}/...)
CREATE POLICY "covers_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
