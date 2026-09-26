USE review_kantin;

-- cek apakah di LIKES, FLAGS dan AUDIT_LOGS ada isinya
SELECT
  (SELECT COUNT(*) FROM dbo.LIKES)      AS likes,
  (SELECT COUNT(*) FROM dbo.FLAGS)      AS flags,
  (SELECT COUNT(*) FROM dbo.AUDIT_LOGS) AS audit_logs;

-- masukin isi LIKES, FLAGS, dann AUDIT_LOGS

INSERT INTO dbo.LIKES (review_id, user_id) VALUES
  (1, 13), (1, 14), (4, 15), (5, 12),
  (6, 13), (8, 12), (11, 13), (14, 15);

UPDATE dbo.REVIEWS
SET like_count = (SELECT COUNT(*) FROM dbo.LIKES l WHERE l.review_id = REVIEWS.id);

INSERT INTO dbo.FLAGS (review_id, reported_by, reason, status) VALUES
  (2,  14, N'Komentar terlalu singkat', 'pending'),
  (3,  15, N'Rating tidak sesuai isi komentar', 'pending'),
  (7,  12, N'Review tidak relevan', 'pending'),
  (9,  14, N'Mengandung promosi', 'dismissed'),
  (12, 15, N'Spam', 'dismissed'),
  (13, 15, N'Informasi menyesatkan', 'resolved'),
  (15, 13, N'Bahasa kurang sopan', 'resolved'),
  (16, 12, N'Review duplikat', 'pending');

INSERT INTO dbo.AUDIT_LOGS (user_id, action, target_table, target_id, metadata) VALUES
  (1,  'CREATE', 'STALLS',     1,  N'{"name":"Warung Bu Tini"}'),
  (3,  'UPDATE', 'STALLS',     3,  N'{"description":"Bakso urat jumbo & beranak"}'),
  (2,  'UPDATE', 'MENU_ITEMS', 1,  N'{"price":15000}'),
  (12, 'CREATE', 'REVIEWS',    1,  N'{"rating":5}'),
  (14, 'CREATE', 'REVIEWS',    6,  N'{"rating":4}'),
  (13, 'LIKE',   'REVIEWS',    1,  NULL),
  (15, 'FLAG',   'REVIEWS',    12, N'{"reason":"Spam"}'),
  (1,  'UPDATE', 'FLAGS',      4,  N'{"status":"resolved"}');

-- cek lagi pake yg select semua tadi yg paling atas

