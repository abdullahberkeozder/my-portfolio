import {expect,test} from '@playwright/test';

type Persona={name:string;email?:string;password?:string;landing:string};

const personas:Persona[]=[
  {name:'müşteri',email:process.env.E2E_CUSTOMER_EMAIL,password:process.env.E2E_CUSTOMER_PASSWORD,landing:'/taleplerim'},
  {name:'usta',email:process.env.E2E_TRADESPERSON_EMAIL,password:process.env.E2E_TRADESPERSON_PASSWORD,landing:'/usta/talepler'},
  {name:'yönetici',email:process.env.E2E_ADMIN_EMAIL,password:process.env.E2E_ADMIN_PASSWORD,landing:'/yonetim/uyusmazliklar'},
];

for(const persona of personas){
  test(`${persona.name} rolüne uygun çalışma alanına yönlendirilir`,async({page})=>{
    test.skip(!persona.email||!persona.password,`${persona.name} E2E kimlik bilgileri tanımlı değil.`);
    await page.goto('/giris');
    await page.getByLabel('E-posta').fill(persona.email!);
    await page.getByLabel('Parola').fill(persona.password!);
    await page.getByRole('button',{name:'Giriş yap'}).click();
    await expect(page).toHaveURL(new RegExp(`${persona.landing.replaceAll('/','\\/')}(?:$|\\?)`));
  });
}

test('korumalı müşteri sayfası girişten sonra başlangıç hedefini korur',async({page})=>{
  test.skip(!process.env.E2E_CUSTOMER_EMAIL||!process.env.E2E_CUSTOMER_PASSWORD,'Müşteri E2E kimlik bilgileri tanımlı değil.');
  await page.goto('/islerim');
  await expect(page).toHaveURL(/\/giris\?next=%2Fislerim|\/giris\?next=\/islerim/);
  await page.getByLabel('E-posta').fill(process.env.E2E_CUSTOMER_EMAIL!);
  await page.getByLabel('Parola').fill(process.env.E2E_CUSTOMER_PASSWORD!);
  await page.getByRole('button',{name:'Giriş yap'}).click();
  await expect(page).toHaveURL(/\/islerim$/);
});
