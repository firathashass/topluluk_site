/**
 * ============================================================
 * ODTÜ UGT Blog — Google Apps Script Backend
 * ============================================================
 *
 * KURULUM TALİMATLARI:
 *
 * 1. Google Drive'da yeni bir Google Sheets dosyası oluşturun.
 *    İlk satıra (başlık satırı) şunları yazın:
 *    id | title | excerpt | content | category | coverImage | author | createdAt | updatedAt | status
 *
 * 2. Google Drive'da blog görselleri için bir klasör oluşturun.
 *    Klasörün ID'sini not edin (URL'deki folders/ sonrasındaki kısım).
 *
 * 3. Google Sheets'te Uzantılar > Apps Script'e gidin.
 *
 * 4. Bu dosyadaki kodu kopyalayıp yapıştırın.
 *
 * 5. Aşağıdaki 3 değişkeni kendi bilgilerinizle doldurun:
 *    - SHEET_ID:       Google Sheets dosyanızın ID'si
 *    - DRIVE_FOLDER_ID: Görsellerin yükleneceği Drive klasörünün ID'si
 *    - ADMIN_PASSWORD:  Blog yönetim şifreniz
 *
 * 6. Dağıt > Yeni dağıtım > Web uygulaması seçin.
 *    - Farklı çalıştır: "Ben" olarak
 *    - Erişim: "Herkes"
 *    - Dağıt'a tıklayın, URL'yi kopyalayın.
 *
 * 7. Kopyaladığınız URL'yi script.js dosyasındaki
 *    ENDPOINTS.blog alanına yapıştırın.
 *
 * ============================================================
 */

// ─── YAPILANDIRMA ──────────────────────────────────────────
const SHEET_ID = 'BURAYA_SHEET_ID_YAZIN';
const DRIVE_FOLDER_ID = 'BURAYA_DRIVE_KLASOR_ID_YAZIN';
const ADMIN_PASSWORD = 'BURAYA_SIFRE_YAZIN';

// ─── YARDIMCI FONKSİYONLAR ────────────────────────────────
function getSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
}

function generateId() {
  return Utilities.getUuid().split('-')[0];
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllPosts() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var posts = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    posts.push(row);
  }
  return posts;
}

function findRowById(id) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) return i + 1; // 1-indexed row number
  }
  return -1;
}

// ─── GET İSTEKLERİ ─────────────────────────────────────────
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';

  if (action === 'list') {
    // Liste artık POST ile alınıyor (şifre URL'de görünmesin diye)
    // GET ile sadece yayınlanmış postlar döner
    var posts = getAllPosts();
    posts = posts.filter(function(p) { return p.status === 'published'; });
    posts = posts.map(function(p) {
      return {
        id: p.id, title: p.title, excerpt: p.excerpt, category: p.category,
        coverImage: p.coverImage, author: p.author, createdAt: p.createdAt,
        updatedAt: p.updatedAt, status: p.status
      };
    });
    posts.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    return jsonResponse({ success: true, posts: posts });
  }

  if (action === 'get') {
    var id = e.parameter.id;
    var posts = getAllPosts();
    var post = posts.filter(function(p) { return p.id == id; })[0];
    if (!post) return jsonResponse({ success: false, error: 'Post bulunamadı' });
    // Taslak yazılar sadece admin tarafından görüntülenebilir
    if (post.status === 'draft') {
      return jsonResponse({ success: false, error: 'Post bulunamadı' });
    }
    return jsonResponse({ success: true, post: post });
  }

  return jsonResponse({ success: false, error: 'Geçersiz istek' });
}

// ─── POST İSTEKLERİ ────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // Şifre gerektirmeyen action'lar
    if (action === 'list') {
      var posts = getAllPosts();
      var showAll = data.admin === true && data.password === ADMIN_PASSWORD;
      if (!showAll) {
        posts = posts.filter(function(p) { return p.status === 'published'; });
      }
      posts = posts.map(function(p) {
        return {
          id: p.id, title: p.title, excerpt: p.excerpt, category: p.category,
          coverImage: p.coverImage, author: p.author, createdAt: p.createdAt,
          updatedAt: p.updatedAt, status: p.status
        };
      });
      posts.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      return jsonResponse({ success: true, posts: posts });
    }

    // Tek post getirme (taslak yazılar için şifre gerekir)
    if (action === 'get') {
      var posts = getAllPosts();
      var post = posts.filter(function(p) { return p.id == data.id; })[0];
      if (!post) return jsonResponse({ success: false, error: 'Post bulunamadı' });
      if (post.status === 'draft' && data.password !== ADMIN_PASSWORD) {
        return jsonResponse({ success: false, error: 'Post bulunamadı' });
      }
      return jsonResponse({ success: true, post: post });
    }

    // Şifre kontrolü (admin action'lar için)
    if (data.password !== ADMIN_PASSWORD) {
      return jsonResponse({ success: false, error: 'Yetkisiz erişim' });
    }

    if (action === 'create') {
      return createPost(data);
    }
    if (action === 'update') {
      return updatePost(data);
    }
    if (action === 'delete') {
      return deletePost(data);
    }
    if (action === 'upload') {
      return uploadImage(data);
    }
    if (action === 'checkAuth') {
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: 'Geçersiz aksiyon' });
  } catch (err) {
    // Hata detaylarını istemciye sızdırma
    Logger.log('doPost error: ' + err.toString());
    return jsonResponse({ success: false, error: 'Sunucu hatası oluştu' });
  }
}

function createPost(data) {
  var sheet = getSheet();
  var id = generateId();
  var now = new Date().toISOString();
  var validStatuses = ['draft', 'published'];
  var status = validStatuses.indexOf(data.status) !== -1 ? data.status : 'draft';

  sheet.appendRow([
    id,
    data.title || '',
    data.excerpt || '',
    data.content || '',
    data.category || 'Genel',
    data.coverImage || '',
    data.author || 'UGT',
    now,
    now,
    status
  ]);

  return jsonResponse({ success: true, id: id });
}

function updatePost(data) {
  var sheet = getSheet();
  var row = findRowById(data.id);
  if (row === -1) return jsonResponse({ success: false, error: 'Post bulunamadı' });

  var now = new Date().toISOString();
  var range = sheet.getRange(row, 1, 1, 10);
  var values = range.getValues()[0];

  values[1] = data.title !== undefined ? data.title : values[1];
  values[2] = data.excerpt !== undefined ? data.excerpt : values[2];
  values[3] = data.content !== undefined ? data.content : values[3];
  values[4] = data.category !== undefined ? data.category : values[4];
  values[5] = data.coverImage !== undefined ? data.coverImage : values[5];
  values[6] = data.author !== undefined ? data.author : values[6];
  values[8] = now;
  var validStatuses = ['draft', 'published'];
  values[9] = (data.status !== undefined && validStatuses.indexOf(data.status) !== -1) ? data.status : values[9];

  range.setValues([values]);
  return jsonResponse({ success: true, id: data.id });
}

function deletePost(data) {
  var sheet = getSheet();
  var row = findRowById(data.id);
  if (row === -1) return jsonResponse({ success: false, error: 'Post bulunamadı' });

  sheet.deleteRow(row);
  return jsonResponse({ success: true });
}

function uploadImage(data) {
  // Dosya tipi kontrolü — sadece görseller ve ses dosyalarına izin ver
  var allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
  var mimeType = data.mimeType || 'image/jpeg';
  if (allowedTypes.indexOf(mimeType) === -1) {
    return jsonResponse({ success: false, error: 'Geçersiz dosya tipi. Sadece JPEG, PNG, GIF, WebP ve ses dosyaları (MP3, WAV, OGG) desteklenir.' });
  }

  // Dosya boyutu kontrolü (base64 ≈ %33 büyük, 5MB limit → ~6.7MB base64)
  if (!data.imageData || data.imageData.length > 7000000) {
    return jsonResponse({ success: false, error: 'Dosya çok büyük. Maksimum 5MB.' });
  }

  // Dosya adından path traversal karakterlerini temizle
  var fileName = (data.fileName || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');

  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  var decoded = Utilities.base64Decode(data.imageData);
  var blob = Utilities.newBlob(decoded, mimeType, fileName);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileId = file.getId();
  var url = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1200';

  return jsonResponse({ success: true, url: url, fileId: fileId });
}
