const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.template.findMany();
  let updatedCount = 0;

  for (const t of templates) {
    if (t.htmlContent) {
      let updatedHtml = t.htmlContent;
      
      // Ganti nama orang tua pria
      updatedHtml = updatedHtml.replace(
        /Putra dari<br>\s*Bapak Wayan & Ibu Ni\s*Nengah/g,
        '{{groomParents}}'
      );
      
      // Ganti nama orang tua wanita
      updatedHtml = updatedHtml.replace(
        /Putri dari<br>\s*Bapak Ketut & Ibu Ni\s*Nyoman/g,
        '{{brideParents}}'
      );
      
      // Ganti Made & Ayu di footer/kutipan
      // The exact string in the quote section is: Made & Ayu
      // And in footer: for Made & Ayu
      updatedHtml = updatedHtml.replace(
        />Made & Ayu\s*<\/h1>/g,
        '>{{groomName}} & {{brideName}}</h1>'
      );
      updatedHtml = updatedHtml.replace(
        /for Made & Ayu/g,
        'for {{groomName}} & {{brideName}}'
      );

      if (updatedHtml !== t.htmlContent) {
        await prisma.template.update({
          where: { id: t.id },
          data: { htmlContent: updatedHtml }
        });
        updatedCount++;
        console.log(`Updated template: ${t.name} (${t.id})`);
      }
    }
  }
  
  console.log(`Finished. Updated ${updatedCount} templates.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
