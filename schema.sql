-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(255),
  university VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  credits INT DEFAULT 2, -- free lectures
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  referral_code VARCHAR(10) UNIQUE,
  referred_by UUID REFERENCES users(id)
);


-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  professor_name VARCHAR(255),
  course_code VARCHAR(50),
  course_name VARCHAR(255),
  department VARCHAR(100),
  semester VARCHAR(50),
  color VARCHAR(7), -- hex color
  created_at TIMESTAMP DEFAULT NOW()
);


-- Lectures
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title VARCHAR(255),
  lecture_number INT,
  date DATE,
  file_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds INT,
  transcript TEXT,
  summary JSONB, -- structured summary
  questions JSONB, -- array of questions
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  view_count INT DEFAULT 0
);


-- Study Groups
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  course_id UUID REFERENCES courses(id),
  created_by UUID REFERENCES users(id),
  join_code VARCHAR(6) UNIQUE,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE group_members (
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- admin, member
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);


-- Shared Lectures
CREATE TABLE shared_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id),
  share_token VARCHAR(20) UNIQUE,
  permission_level VARCHAR(50) DEFAULT 'view',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  view_count INT DEFAULT 0
);


-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount_cents INT,
  currency VARCHAR(3) DEFAULT 'USD',
  type VARCHAR(50), -- lecture, subscription, credits
  stripe_payment_id VARCHAR(255),
  status VARCHAR(50), -- succeeded, failed, pending
  created_at TIMESTAMP DEFAULT NOW()
);


-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),
  referee_id UUID REFERENCES users(id),
  converted BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);


-- Analytics
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(50), -- dorm, major, class
  entity_name VARCHAR(255),
  lectures_processed INT DEFAULT 0,
  total_minutes INT DEFAULT 0,
  week VARCHAR(10), -- YYYY-WW
  updated_at TIMESTAMP DEFAULT NOW()
);
