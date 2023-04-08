const multer=require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,'public/admin/images/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })

  const multiUpload = upload.fields([{ name:'image', maxCount: 1 }, { name: 'SubImage', maxCount: 5 }])
  
  module.exports=multiUpload;