const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/logout');

  await page.goto('http://localhost:3000/register');
  // await page.screenshot({path: 'example.png'});
  await page.type('#email', 'testuser@mail.com')
  await page.type('#password', '12345678');

  await Promise.all([
  	page.waitForNavigation(),
  	page.click('#registerButton')
  ]);

  await page.goto('http://localhost:3000/login');
  // await page.screenshot({path: 'example.png'});
  await page.type('#email', 'testuser@mail.com')
  await page.type('#password', '12345678');

  await Promise.all([
  	page.waitForNavigation(),
  	page.click('#login')
  ]);

  await Promise.all([
  	page.waitForNavigation(),
  	page.click('#newPoll')
  ]);

  await page.type('#title', 'Test title');
  await page.type('#description', 'This is a test description');
  await page.type('#opt0', 'A test');
  await page.type('#opt1', 'B test');

  await Promise.all([
  	page.waitForNavigation(),
  	page.click('#createPoll')
  ]);

  await page.goto('http://localhost:3000/logout');
  
  await browser.close();
})();