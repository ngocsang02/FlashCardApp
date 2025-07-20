const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: 'dgln3kmbt',
  api_key: '123256545382126',
  api_secret: '3dRan57a2FrSUIcnoiBxkGQso5I'
});

const app = express();
const PORT = process.env.PORT || 5000;

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file CSV'), false);
    }
  }
});

// Multer config cho ảnh (khác với file CSV)
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'), false);
    }
  }
});

// Multer config cho upload ảnh lên Cloudinary (dùng memoryStorage)
const memoryUpload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard-app';
const isLocal = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  if (isLocal) {
    console.log('💡 Local MongoDB không kết nối được. Hãy đảm bảo:');
    console.log('   1. MongoDB đã được cài đặt');
    console.log('   2. MongoDB service đang chạy: net start MongoDB');
    console.log('   3. Hoặc chạy thủ công: mongod');
  }
});
db.once('open', () => {
  console.log(`✅ Connected to MongoDB: ${isLocal ? 'LOCAL' : 'ATLAS'}`);
  console.log(`📊 Database: ${mongoUri.split('/').pop().split('?')[0]}`);
});

// Vocabulary Schema
const vocabularySchema = new mongoose.Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  language: { type: String, default: 'english' },
  topic: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Routes

// Get all vocabulary
app.get('/api/vocabulary', async (req, res) => {
  try {
    const { language, topic } = req.query;
    let query = {};
    
    if (language) query.language = language;
    if (topic) query.topic = topic;
    
    const vocabularies = await Vocabulary.find(query).sort({ createdAt: -1 });
    res.json(vocabularies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await Vocabulary.aggregate([
      {
        $group: {
          _id: {
            language: '$language',
            topic: '$topic'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.language',
          topics: {
            $push: {
              topic: '$_id.topic',
              count: '$count'
            }
          },
          totalWords: { $sum: '$count' }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new vocabulary
app.post('/api/vocabulary', async (req, res) => {
  try {
    const { word, meaning, imageUrl, language, topic } = req.body;
    const newVocabulary = new Vocabulary({
      word: word.toLowerCase().trim(),
      meaning: meaning.trim(),
      imageUrl,
      language: language || 'english',
      topic: topic || 'general'
    });
    const savedVocabulary = await newVocabulary.save();
    res.status(201).json(savedVocabulary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add multiple vocabulary from CSV
app.post('/api/vocabulary/bulk', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file CSV' });
    }

    const { topic, language } = req.body; // Get topic and language from form data
    console.log('Uploaded file:', req.file);
    console.log('Topic:', topic);
    console.log('Language:', language);

    if (!topic) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Vui lòng nhập chủ đề cho file CSV' });
    }

    if (!language) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Vui lòng chọn ngôn ngữ cho file CSV' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          console.log('Total CSV rows:', results.length);
          
          // Validate CSV structure
          if (results.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'File CSV trống' });
          }

          const firstRow = results[0];
          if (!firstRow.word || !firstRow.meaning) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
              message: 'File CSV phải có các cột: word, meaning, imageUrl (tùy chọn)' 
            });
          }

          const vocabularies = results.map(row => ({
            word: row.word?.toLowerCase().trim() || '',
            meaning: row.meaning?.trim() || '',
            imageUrl: row.imageUrl?.trim() || '',
            language: language, // Use language from form data
            topic: topic // Use topic from form data
          })).filter(v => v.word && v.meaning); // Only require word and meaning

          if (vocabularies.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Không có dữ liệu hợp lệ trong file CSV' });
          }

          // Check for duplicates in DB
          const existingWords = await Vocabulary.find({ 
            word: { $in: vocabularies.map(v => v.word) },
            language: language,
            topic: topic
          });
          const existingWordSet = new Set(existingWords.map(v => v.word));

          // Only keep new words
          const newVocabularies = vocabularies.filter(v => !existingWordSet.has(v.word));

          if (newVocabularies.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Tất cả các từ trong file đã tồn tại trong chủ đề này.' });
          }

          const savedVocabularies = await Vocabulary.insertMany(newVocabularies);
          fs.unlinkSync(req.file.path); // Delete temporary file
          res.status(201).json({
            imported: savedVocabularies.length,
            skipped: existingWords.length,
            message: `Đã import ${savedVocabularies.length} từ mới, bỏ qua ${existingWords.length} từ đã tồn tại.`
          });
        } catch (error) {
          console.error('CSV import error:', error);
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          res.status(400).json({ message: `Lỗi khi import CSV: ${error.message}` });
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ message: 'Lỗi khi đọc file CSV' });
      });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: `Lỗi server: ${error.message}` });
  }
});

// API upload ảnh lên Cloudinary
app.post('/api/upload', memoryUpload.single('image'), async (req, res) => {
  console.log('DEBUG /api/upload req.file:', req.file);
  try {
    const file = req.file;
    if (!file) {
      console.log('DEBUG /api/upload: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    let stream = cloudinary.uploader.upload_stream(
      { folder: 'vocabularies' },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ url: result.secure_url });
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  } catch (err) {
    console.log('DEBUG /api/upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// API xóa ảnh
app.delete('/api/upload', (req, res) => {
  // Nhận tên file qua query hoặc body
  const fileUrl = req.query.url || req.body?.url;
  if (!fileUrl) return res.status(400).json({ error: 'Thiếu url file' });
  // Lấy tên file từ url
  const filename = fileUrl.split('/').pop();
  const filePath = `./uploads/${filename}`;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File không tồn tại' });
  }
  try {
    fs.unlinkSync(filePath);
    res.json({ message: 'Đã xóa file thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa file' });
  }
});

// Cho phép truy cập file tĩnh trong thư mục uploads
app.use('/uploads', express.static('uploads'));

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File quá lớn' });
    }
    return res.status(400).json({ message: `Lỗi upload file: ${error.message}` });
  }
  if (error.message === 'Chỉ chấp nhận file CSV') {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

// Get quiz questions
app.get('/api/quiz', async (req, res) => {
  try {
    const { type = 'word-to-image', count = 10, language, topic } = req.query;
    let filter = {};
    if (language) filter.language = language;
    if (topic && topic !== 'all') filter.topic = topic;
    const allVocabularies = await Vocabulary.find(filter);
    
    if (allVocabularies.length < 4) {
      return res.status(400).json({ message: 'Cần ít nhất 4 từ vựng để tạo bài kiểm tra' });
    }

    const questions = [];
    const shuffledVocabularies = allVocabularies.sort(() => Math.random() - 0.5);
    const questionCount = Math.min(count, shuffledVocabularies.length);

    for (let i = 0; i < questionCount; i++) {
      const correctAnswer = shuffledVocabularies[i];
      // Random loại câu hỏi cho mixed
      let qType = type;
      if (type === 'mixed') {
        const types = ['word-to-image', 'image-to-word', 'image-fill-word'];
        qType = types[Math.floor(Math.random() * types.length)];
      }

      if (qType === 'image-to-word') {
        // Lấy pool các từ sai (không trùng từ đúng)
        const pool = shuffledVocabularies.filter(
          v => v._id.toString() !== correctAnswer._id.toString() && v.word !== correctAnswer.word
        );
        for (let j = pool.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [pool[j], pool[k]] = [pool[k], pool[j]];
        }
        const usedWords = new Set([correctAnswer.word]);
        const wrongAnswers = [];
        for (let w = 0; w < pool.length && wrongAnswers.length < 3; w++) {
          if (!usedWords.has(pool[w].word)) {
            wrongAnswers.push(pool[w]);
            usedWords.add(pool[w].word);
          }
        }
        while (wrongAnswers.length < 3) {
          const candidate = allVocabularies[Math.floor(Math.random() * allVocabularies.length)];
          if (!usedWords.has(candidate.word)) {
            wrongAnswers.push(candidate);
            usedWords.add(candidate.word);
          }
        }
        const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        questions.push({
          type: 'image-to-word',
          question: correctAnswer.imageUrl,
          vocabulary: correctAnswer,
          answers: allAnswers.map(v => ({
            id: v._id,
            text: v.word,
            meaning: v.meaning,
            topic: v.topic,
            imageUrl: v.imageUrl,
            isCorrect: v._id.toString() === correctAnswer._id.toString()
          }))
        });
      } else if (qType === 'word-to-meaning') {
        // Hiển thị từ, chọn nghĩa đúng
        const pool = shuffledVocabularies.filter(
          v => v._id.toString() !== correctAnswer._id.toString() && v.meaning !== correctAnswer.meaning
        );
        for (let j = pool.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [pool[j], pool[k]] = [pool[k], pool[j]];
        }
        const usedMeanings = new Set([correctAnswer.meaning]);
        const wrongAnswers = [];
        for (let w = 0; w < pool.length && wrongAnswers.length < 3; w++) {
          if (!usedMeanings.has(pool[w].meaning)) {
            wrongAnswers.push(pool[w]);
            usedMeanings.add(pool[w].meaning);
          }
        }
        while (wrongAnswers.length < 3) {
          const candidate = allVocabularies[Math.floor(Math.random() * allVocabularies.length)];
          if (!usedMeanings.has(candidate.meaning)) {
            wrongAnswers.push(candidate);
            usedMeanings.add(candidate.meaning);
          }
        }
        const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        questions.push({
          type: 'word-to-meaning',
          question: correctAnswer.word,
          vocabulary: correctAnswer,
          answers: allAnswers.map(v => ({
            id: v._id,
            text: v.meaning,
            word: v.word,
            topic: v.topic,
            imageUrl: v.imageUrl,
            isCorrect: v._id.toString() === correctAnswer._id.toString()
          }))
        });
      } else if (qType === 'image-fill-word') {
        // 1 hình và input điền từ
        questions.push({
          type: 'image-fill-word',
          question: correctAnswer.imageUrl,
          correctAnswer: correctAnswer.word,
          vocabulary: correctAnswer
        });
      } else {
        // word-to-image
        const pool = shuffledVocabularies.filter(
          v => v._id.toString() !== correctAnswer._id.toString() && v.imageUrl !== correctAnswer.imageUrl
        );
        for (let j = pool.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [pool[j], pool[k]] = [pool[k], pool[j]];
        }
        const usedImages = new Set([correctAnswer.imageUrl]);
        const wrongAnswers = [];
        for (let w = 0; w < pool.length && wrongAnswers.length < 3; w++) {
          if (!usedImages.has(pool[w].imageUrl)) {
            wrongAnswers.push(pool[w]);
            usedImages.add(pool[w].imageUrl);
          }
        }
        while (wrongAnswers.length < 3) {
          const candidate = allVocabularies[Math.floor(Math.random() * allVocabularies.length)];
          if (!usedImages.has(candidate.imageUrl)) {
            wrongAnswers.push(candidate);
            usedImages.add(candidate.imageUrl);
          }
        }
        const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        questions.push({
          type: 'word-to-image',
          question: correctAnswer.word,
          vocabulary: correctAnswer,
          answers: allAnswers.map(v => ({
            id: v._id,
            text: v.word,
            meaning: v.meaning,
            topic: v.topic,
            imageUrl: v.imageUrl,
            isCorrect: v._id.toString() === correctAnswer._id.toString()
          }))
        });
      }
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vocabulary
app.put('/api/vocabulary/:id', async (req, res) => {
  try {
    const { word, meaning, imageUrl, language, topic } = req.body;
    const updatedVocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      {
        word: word?.toLowerCase().trim(),
        meaning: meaning?.trim(),
        imageUrl,
        language,
        topic
      },
      { new: true }
    );
    
    if (!updatedVocabulary) {
      return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
    }
    
    res.json(updatedVocabulary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete vocabulary
app.delete('/api/vocabulary/:id', async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndDelete(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
    }

    // Nếu có ảnh Cloudinary thì xóa luôn
    if (vocabulary.imageUrl && vocabulary.imageUrl.includes('cloudinary.com')) {
      // Lấy public_id từ URL
      const matches = vocabulary.imageUrl.match(/upload\/v\d+\/(.+)\.[a-zA-Z]+$/);
      if (matches && matches[1]) {
        const publicId = matches[1];
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error('Lỗi xóa ảnh Cloudinary:', error);
          } else {
            console.log('Kết quả xóa ảnh Cloudinary:', result);
          }
        });
      }
    }

    res.json({ message: 'Đã xóa từ vựng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all vocabularies by topic
app.delete('/api/vocabulary/topic/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const { language } = req.query;
    
    let query = { topic };
    if (language) {
      query.language = language;
    }
    
    // Lấy tất cả vocabularies sẽ bị xóa
    const vocabularies = await Vocabulary.find(query);
    // Xóa ảnh Cloudinary nếu có
    for (const vocab of vocabularies) {
      if (vocab.imageUrl && vocab.imageUrl.includes('cloudinary.com')) {
        const matches = vocab.imageUrl.match(/upload\/v\d+\/(.+)\.[a-zA-Z]+$/);
        if (matches && matches[1]) {
          const publicId = matches[1];
          cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
              console.error('Lỗi xóa ảnh Cloudinary:', error);
            } else {
              console.log('Kết quả xóa ảnh Cloudinary:', result);
            }
          });
        }
      }
    }
    
    const result = await Vocabulary.deleteMany(query);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chủ đề để xóa' });
    }
    
    res.json({ 
      message: `Đã xóa ${result.deletedCount} từ vựng trong chủ đề "${topic}"`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all vocabularies by language
app.delete('/api/vocabulary/language/:language', async (req, res) => {
  try {
    const { language } = req.params;
    // Lấy tất cả vocabularies sẽ bị xóa
    const vocabularies = await Vocabulary.find({ language });
    // Xóa ảnh Cloudinary nếu có
    for (const vocab of vocabularies) {
      if (vocab.imageUrl && vocab.imageUrl.includes('cloudinary.com')) {
        const matches = vocab.imageUrl.match(/upload\/v\d+\/(.+)\.[a-zA-Z]+$/);
        if (matches && matches[1]) {
          const publicId = matches[1];
          cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
              console.error('Lỗi xóa ảnh Cloudinary:', error);
            } else {
              console.log('Kết quả xóa ảnh Cloudinary:', result);
            }
          });
        }
      }
    }
    const result = await Vocabulary.deleteMany({ language });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ngôn ngữ để xóa' });
    }
    
    res.json({ 
      message: `Đã xóa ${result.deletedCount} từ vựng trong ngôn ngữ "${language}"`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get topics by language
app.get('/api/topics/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const topics = await Vocabulary.distinct('topic', { language });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get languages
app.get('/api/languages', async (req, res) => {
  try {
    const languages = await Vocabulary.distinct('language');
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get languages that have at least one topic (topic khác rỗng)
app.get('/api/vocabulary/languages-with-topic', async (req, res) => {
  try {
    // Lấy tất cả các ngôn ngữ có topic khác rỗng
    const languages = await Vocabulary.aggregate([
      { $match: { topic: { $ne: '' } } },
      { $group: { _id: '$language' } },
      { $project: { _id: 0, language: '$_id' } }
    ]);
    res.json(languages.map(l => l.language));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single vocabulary by id
app.get('/api/vocabulary/:id', async (req, res) => {
  try {
    const vocab = await Vocabulary.findById(req.params.id);
    if (!vocab) {
      return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
    }
    res.json(vocab);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Settings routes
app.get('/api/settings/default-language', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'defaultLanguage' });
    res.json({ defaultLanguage: setting ? setting.value : '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/settings/default-language', async (req, res) => {
  try {
    const { defaultLanguage } = req.body;
    
    // Upsert: tạo mới nếu chưa có, cập nhật nếu đã có
    await Settings.findOneAndUpdate(
      { key: 'defaultLanguage' },
      { 
        key: 'defaultLanguage',
        value: defaultLanguage || '',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      message: 'Cập nhật ngôn ngữ mặc định thành công',
      defaultLanguage: defaultLanguage || ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 