-- Seed contents data
INSERT INTO public.contents (type, title, description, metadata, created_by) VALUES
  (
    'movie', '인터스텔라',
    '우주를 배경으로 시간과 사랑을 탐구하는 SF 걸작',
    '{"director": "크리스토퍼 놀란", "release_year": 2014, "genres": ["SF", "드라마"]}',
    null
  ),
  (
    'movie', '기생충',
    '봉준호 감독의 아카데미 작품상 수상 사회 비판 영화',
    '{"director": "봉준호", "release_year": 2019, "genres": ["스릴러", "드라마"]}',
    null
  ),
  (
    'drama', '이상한 변호사 우영우',
    '자폐 스펙트럼을 가진 천재 변호사의 성장 이야기',
    '{"director": "유인식", "air_year": 2022, "episodes": 16, "genres": ["법정", "드라마"]}',
    null
  ),
  (
    'drama', '오징어 게임',
    '456억 원의 상금이 걸린 생존 게임에 뛰어든 사람들의 이야기',
    '{"director": "황동혁", "air_year": 2021, "episodes": 9, "genres": ["스릴러", "액션"]}',
    null
  ),
  (
    'book', '채식주의자',
    '한강의 부커 국제상 수상 소설. 폭력과 억압에 저항하는 한 여성의 이야기',
    '{"author": "한강", "publish_year": 2007, "publisher": "창비"}',
    null
  ),
  (
    'book', '82년생 김지영',
    '평범한 한국 여성의 삶을 통해 사회 구조적 문제를 조명한 소설',
    '{"author": "조남주", "publish_year": 2016, "publisher": "민음사"}',
    null
  );
