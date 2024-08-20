const fs=require('fs') //node.js 操作本地文件
var express=require('express'); //node.js 用来开发rest api 

var app=express();
app.use(express.json()); //api 可以用于传输json的数据，json parser for post request
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept"); //For Post COrs Error 跨域问题
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    next();
}); //可以让浏览器可以读取rest api

var booksJsonFile = __dirname + '/books.json';

//Get content from a JSON FILE
app.get('/json_file',(req,res)=>{
    try{
        //使用fs模块同步读取JSON文件
        let data = fs.readFileSync(`${__dirname}/${req.query.name}.json`)
        //将读取的文件内容解析为JSON并发送给客户端
        res.json(JSON.parse(data));
    }catch(err){
        //捕获任何错误并将错误信息发送回客户端
        res.send({'error':err.toString()});
    }
});

//Get book details
app.get('/book',(req,res)=>{
    try{
        //Get whole book list
        let books=JSON.parse(fs.readFileSync(booksJsonFile));
        const titleName=req.query.title;
        let responseBook={}
        books.forEach(function(book,index){
            if(book['title']==titleName)
            {
                responseBook=book;
            }
        })
        res.json(responseBook);

    }catch(err){
        res.send({'error':err.toString()})
    }
});

//Create Json File
app.put('/json_file',(req,res)=>{
    try{
        //构造文件路径
        const fileName=__dirname+'/'+req.query.name+'.json';
        //获取请求体中的数据
        let bodyData=req.body;
        //打开指定文件，如果文件不存在则需要重建
        fs.open(fileName,'r',(err,fd)=>{
            fs.writeFile(fileName,JSON.stringify(bodyData),(err)=>{if(err)console.log(err);});//Create new file
        })
        //如果成功，返回消息给客户端
        res.send({'success':'File successfully created.'})
    }catch(err){
        res.send({'error':err.toString()});
    }
});

//add new book
app.put('/book',(req,res)=>{
    try{
        let bookInfo=req.body;
        fs.open(booksJsonFile,'r',(err,fd)=>{
            let fileContent=JSON.parse(fs.readFileSync(booksJsonFile,'utf8'));
            fileContent.push(bookInfo);
            fs.writeFileSync(booksJsonFile,JSON.stringify(fileContent));
        });

        res.send({'success':'Add book successfully.'})

    }catch(err){
        res.send({'error':err.toString()});
    }

});

//Update JSON File
app.post('/json_file',(req,res)=>{
    try{
        const fileName=__dirname+'/'+'books.json';
        let bodyData=req.body;
        fs.open(fileName,'r',(err,fd)=>{
            //读取现有的JSON文件内容并且解析为javascript对象
            let books=JSON.parse(fs.readFileSync(fileName,'utf8'));
            //遍历请求体中的数据，将每个新书籍对象添加到现有的书籍数组中
            bodyData.forEach(newBook => {
                books.push(newBook)             
            });
            //将更新后的books数组重新写回到json文件中
            fs.writeFileSync(fileName,JSON.stringify(books));
        });
        res.send({'success':'File successfully updated.'})

    }catch(err){
        res.send({'error':err.toString()});
    }
});

//update book details
app.post('/book',(req,res)=>{
    try{
        const bookTittle=req.query.tittle;
        let bodyData=req.body;
        let found=false;
        fs.open(booksJsonFile,'r',(err,fd)=>{
            var books=JSON.parse(fs.readFileSync(booksJsonFile,'utf8'));
            books.forEach(function(book,index){
                if(book['title']==bookTittle)
                {
                    found=true;
                    book['title']=bodyData['title'];
                    book['web_url']=bodyData['web_url'];
                    book['image_url']=bodyData['image_url'];
                }
            })

            if(found)
            {
                fs.writeFileSync(booksJsonFile,JSON.stringify(books));
                res.send({'success':'Update book successfully.'});
            }
            else
            {
                res.send({'error':bookTittle+'not found.'});
            }
        });

    }catch(err){
        res.send({'error':err.toString()});
    }

});
//Delete JSON File
app.delete('/json_file',(req,res)=>{
    try{
        //使用fs.unlinkSync 删除指定文件
        fs.unlinkSync(__dirname+"/"+req.query.name+'.json');
        res.send({'success':'File deleted.'})
    }catch(err){
        res.send({'error':err.toString()});
    }
});

//delete book
app.delete('/book', (req, res) => {
    let bookTitle = req.query.title;
    let books = JSON.parse(fs.readFileSync(booksJsonFile));
    var bookIndex = -1;
    books.forEach(function(book, index) {
        if (book['title'] == bookTitle) {
            bookIndex = index;
        }
    })
    if (bookIndex > -1) {
        books.splice(bookIndex, 1);
        fs.writeFileSync(booksJsonFile, JSON.stringify(books));
        res.send({'success': 'Delete book successfully.'});
    } else {
        res.send({'error': bookTitle + ' not found.'});
    }
})

//让server跑起来
const port = 8080
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});