const express = require('express');

const app = express();
const puppeteer = require('puppeteer');
const bodyParser = require("body-parser");




app.use(express.json({ extended: false }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/', function (req, res) {
    var result;

    var faculty = req.body.faculty;
    var enrollment = req.body.enrollment;

    (async () => {
        const browser = await puppeteer.launch({ headless: true });

        const page = await browser.newPage();
        page.once('dialog', async dialog => {
            await dialog.dismiss();
        }),
            await page.goto('http://ctengg.amu.ac.in/web/st_result001.php?prog=btech', { waitUntil: 'networkidle2', timeout: 0 });
        page.setDefaultNavigationTimeout(0);

        await page.type('input[name=fac]', faculty);
        await page.type('input[name=en]', enrollment);



        await Promise.all([

            await page.evaluate(() => document.querySelector("button[id=att_submit]").click()),

            page.waitForNavigation({ waitUntil: 'networkidle0' }),

        ]);



        const data = await page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('table tr td'))
            return tds.map(td => td.innerText)
        });

        var size = data.length;
        var infoAt = size - 7;

        var facno = data[infoAt];
        var eno = data[infoAt + 1];
        var name = data[infoAt + 2];
        var spi = data[infoAt + 4];
        var cpi = data[infoAt + 5];
        var subjects = [];
        for (var i = 0; i < infoAt; i += 7) {
            var subject = {
                code: data[i], sessionals: data[i + 1], exam: data[i + 2], total: data[i + 3], grace: data[i + 4],
                grades: data[i + 5], range: data[i + 6]
            };

            subjects.push(subject);

        };
        result = { sub: subjects, info: { facno: facno, eno: eno, name: name, cpi: cpi, spi: spi } };





        console.log(result);


        res.send(result)
        console.log("data saved");
        page.close();


        await browser.close();
    })();
})




const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('started'));
