const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const aluno1 = await prisma.aluno.create({
        data: {
            nome: 'Giorno Giovanna',
            email: 'giogio01goldwind@gmail.com',
            idade: 15,
            turma: '1A',
        },
    });

    const aluno2 = await prisma.aluno.create({
        data: {
            nome:  'Jotaro Kujo',
            email: 'jojoK@gmail.com',
            idade: 17,
            turma: '3A',
        },
    });

    console.log('Alunos Inseridos!', {aluno1, aluno2});

}


main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () =>{
        await prisma.$disconnect();
    });

