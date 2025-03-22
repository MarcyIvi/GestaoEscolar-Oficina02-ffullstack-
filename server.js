const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const app = express();
const prisma = new PrismaClient();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Função para validar notas
function validarNotas(notas) {
    const disciplinas = ['artes', 'matematica', 'ciencias', 'historia', 'portugues', 'geografia', 'filosofia', 'educacao_fisica'];
    for (const disciplina of disciplinas) {
        const nota = parseFloat(notas[disciplina]);
        if (isNaN(nota)) {
            return false;
        }
        if (nota < 0 || nota > 10) {
            return false;
        }
    }
    return true;
}

// Função para gerar o menu de navegação
function gerarMenu() {
    return `
    <nav class="menu-navegacao">
        <a href="/">Alunos</a> |
        <a href="/professores">Professores</a> |
        <a href="/associar-aluno-professor">Associar Aluno a Professor</a> |
        <a href="/selecionar-aluno-boletim">Boletins</a>
    </nav>
    `;
}

// Rota principal (Lista de Alunos)
app.get('/', async (req, res) => {
    try {
        const alunos = await prisma.aluno.findMany({ include: { professores: true } });

        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Alunos</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Lista de Alunos da Escola</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Idade</th>
                        <th>Turma</th>
                        <th>Professores</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        alunos.forEach(aluno => {
            html += `
                <tr>
                    <td>${aluno.id}</td>
                    <td>${aluno.nome}</td>
                    <td>${aluno.email}</td>
                    <td>${aluno.idade}</td> 
                    <td>${aluno.turma}</td>
                    <td>
                        <ul>
                            ${aluno.professores.map(professor => `<li>${professor.nome} (${professor.disciplina})</li>`).join('')}
                        </ul>
                    </td>
                    <td>
                        <form action="/atualizar-aluno/${aluno.id}" method="GET" style="display:inline">
                             <button type="submit">Atualizar</button>
                        </form>

                        <form action="/remover-aluno" method="POST" style="display:inline">
                            <input type="hidden" name="id" value=${aluno.id}>
                            <button type="submit">Remover</button>
                        </form>

                        <button onclick="location.href='/boletim/${aluno.id}'">Ver Boletim</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <br>
            <button onclick="location.href='/novo-aluno'">Adicionar novo aluno</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar dados de todos os alunos.');
    }
});

// Rotas para Alunos
app.get('/novo-aluno', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang= "pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Adicionar Novo Aluno</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        ${gerarMenu()}
        <h1>Adicionar Novo Aluno</h1>
        <form action="/novo-aluno" method="POST">
            <label for="nome">Nome:</label><br>
            <input type="text" id="nome" name="nome" required><br><br>

            <label  for="email">Email:</label><br>
            <input type="email" id="email" name="email" required><br><br>

            <label  for="idade">Idade:</label><br>
            <input type="number" id="idade" name="idade" required><br><br>

            <label for="turma">Turma:</label><br>
            <input type="text" id="turma" name="turma" required><br><br>

            <button type="submit">Adicionar Alunos</button>
        </form>
        <br>
        <button onclick="location.href='/'">Voltar para a Lista</button>
        </body>
        </html>
    `;
    res.send(html);
});

app.post('/novo-aluno', async (req, res) => {
    const { nome, email, idade, turma } = req.body;
    try {
        await prisma.aluno.create({
            data: {
                nome, 
                email,
                idade: parseInt(idade),
                turma
            }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao adicionar o aluno.');
    }
});

app.get('/atualizar-aluno/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const aluno = await prisma.aluno.findUnique({
            where: { id: parseInt(id) }
        });

        if (!aluno) {
            return res.status(404).send('Aluno não encontrado.');
        }

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Editar Aluno</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Editar Aluno</h1>
            <form action="/atualizar-aluno/${aluno.id}" method="POST">
                <label for="nome">Nome:</label><br>
                <input type="text" id="nome" name="nome" value="${aluno.nome}" required><br><br>

                <label for="email">Email:</label><br>
                <input type="email" id="email" name="email" value="${aluno.email}" required><br><br>

                <label for="idade">Idade:</label><br>
                <input type="number" id="idade" name="idade" value="${aluno.idade}" required><br><br>

                <label for="turma">Turma:</label><br>
                <input type="text" id="turma" name="turma" value="${aluno.turma}" required><br><br>

                <button type="submit">Atualizar Aluno</button>
            </form>
            <br>
            <button onclick="location.href='/'">Voltar para a Lista</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar formulário de edição.');
    }
});

app.post('/atualizar-aluno/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, idade, turma } = req.body;
    try {
        await prisma.aluno.update({
            where: { id: parseInt(id) },
            data: { nome, email, idade: parseInt(idade), turma }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar aluno.');
    }
});

app.post('/remover-aluno', async (req, res) => {
    const { id } = req.body;
    try {
        await prisma.aluno.delete({
            where: { id: parseInt(id) }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao remover o aluno");
    }
});

// Rotas para Professores
app.get('/professores', async (req, res) => {
    try {
        const professores = await prisma.professor.findMany({ include: { alunos: true } });

        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Professores</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Lista de Professores da Escola</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Disciplina</th>
                        <th>Alunos</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        professores.forEach(professor => {
            html += `
                <tr>
                    <td>${professor.id}</td>
                    <td>${professor.nome}</td>
                    <td>${professor.email}</td>
                    <td>${professor.disciplina}</td>
                    <td>
                        <ul>
                            ${professor.alunos.map(aluno => `<li>${aluno.nome}</li>`).join('')}
                        </ul>
                    </td>
                    <td>
                        <form action="/atualizar-professor/${professor.id}" method="GET" style="display:inline">
                            <button type="submit">Atualizar</button>
                        </form>

                        <form action="/remover-professor" method="POST" style="display:inline">
                            <input type="hidden" name="id" value=${professor.id}>
                            <button type="submit">Remover</button>
                        </form>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <br>
            <button onclick="location.href='/novo-professor'">Adicionar novo professor</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar professores.');
    }
});

app.get('/novo-professor', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Adicionar Novo Professor</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        ${gerarMenu()}
        <h1>Adicionar Novo Professor</h1>
        <form action="/novo-professor" method="POST">
            <label for="nome">Nome:</label><br>
            <input type="text" id="nome" name="nome" required><br><br>

            <label for="email">Email:</label><br>
            <input type="email" id="email" name="email" required><br><br>

            <label for="disciplina">Disciplina:</label><br>
            <input type="text" id="disciplina" name="disciplina" required><br><br>

            <button type="submit">Adicionar Professor</button>
        </form>
        <br>
        <button onclick="location.href='/professores'">Voltar para a Lista</button>
    </body>
    </html>
    `;
    res.send(html);
});

app.post('/novo-professor', async (req, res) => {
    const { nome, email, disciplina } = req.body;
    try {
        await prisma.professor.create({
            data: { nome, email, disciplina }
        });
        res.redirect('/professores');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao adicionar professor.');
    }
});

app.get('/atualizar-professor/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const professor = await prisma.professor.findUnique({
            where: { id: parseInt(id) }
        });

        if (!professor) {
            return res.status(404).send('Professor não encontrado.');
        }

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Editar Professor</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Editar Professor</h1>
            <form action="/atualizar-professor/${professor.id}" method="POST">
                <label for="nome">Nome:</label><br>
                <input type="text" id="nome" name="nome" value="${professor.nome}" required><br><br>

                <label for="email">Email:</label><br>
                <input type="email" id="email" name="email" value="${professor.email}" required><br><br>

                <label for="disciplina">Disciplina:</label><br>
                <input type="text" id="disciplina" name="disciplina" value="${professor.disciplina}" required><br><br>

                <button type="submit">Atualizar Professor</button>
            </form>
            <br>
            <button onclick="location.href='/professores'">Voltar para a Lista</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar formulário de edição.');
    }
});

app.post('/atualizar-professor/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, disciplina } = req.body;
    try {
        await prisma.professor.update({
            where: { id: parseInt(id) },
            data: { nome, email, disciplina }
        });
        res.redirect('/professores');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar professor.');
    }
});

app.post('/remover-professor', async (req, res) => {
    const { id } = req.body;
    try {
        await prisma.professor.delete({
            where: { id: parseInt(id) }
        });
        res.redirect('/professores');
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao remover o professor");
    }
});

// Rotas para Boletins
app.get('/adicionar-boletim/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    try {
        const aluno = await prisma.aluno.findUnique({
            where: { id: parseInt(alunoId) }
        });

        if (!aluno) {
            return res.status(404).send('Aluno não encontrado.');
        }

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Adicionar Boletim</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Adicionar Boletim para ${aluno.nome}</h1>
            <form action="/adicionar-boletim/${alunoId}" method="POST">
                <label for="artes">Artes:</label><br>
                <input type="number" id="artes" name="artes" step="0.1" min="0" max="10" required><br><br>

                <label for="matematica">Matemática:</label><br>
                <input type="number" id="matematica" name="matematica" step="0.1" min="0" max="10" required><br><br>

                <label for="ciencias">Ciências:</label><br>
                <input type="number" id="ciencias" name="ciencias" step="0.1" min="0" max="10" required><br><br>

                <label for="historia">História:</label><br>
                <input type="number" id="historia" name="historia" step="0.1" min="0" max="10" required><br><br>

                <label for="portugues">Português:</label><br>
                <input type="number" id="portugues" name="portugues" step="0.1" min="0" max="10" required><br><br>

                <label for="geografia">Geografia:</label><br>
                <input type="number" id="geografia" name="geografia" step="0.1" min="0" max="10" required><br><br>

                <label for="filosofia">Filosofia:</label><br>
                <input type="number" id="filosofia" name="filosofia" step="0.1" min="0" max="10" required><br><br>

                <label for="educacao_fisica">Educação Física:</label><br>
                <input type="number" id="educacao_fisica" name="educacao_fisica" step="0.1" min="0" max="10" required><br><br>

                <button type="submit">Adicionar Boletim</button>
            </form>
            <br>
            <button onclick="location.href='/boletim/${alunoId}'">Voltar ao Boletim</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar formulário de boletim.');
    }
});

app.post('/adicionar-boletim/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    const { artes, matematica, ciencias, historia, portugues, geografia, filosofia, educacao_fisica } = req.body;

    const notas = {
        artes: parseFloat(artes),
        matematica: parseFloat(matematica),
        ciencias: parseFloat(ciencias),
        historia: parseFloat(historia),
        portugues: parseFloat(portugues),
        geografia: parseFloat(geografia),
        filosofia: parseFloat(filosofia),
        educacao_fisica: parseFloat(educacao_fisica)
    };

    if (!validarNotas(notas)) {
        return res.status(400).send('Todas as notas devem estar entre 0 e 10.');
    }

    try {
        await prisma.boletim.create({
            data: {
                alunoId: parseInt(alunoId),
                ...notas
            }
        });
        res.redirect(`/boletim/${alunoId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao adicionar boletim.');
    }
});

app.get('/boletim/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    try {
        const boletim = await prisma.boletim.findFirst({
            where: { alunoId: parseInt(alunoId) }
        });

        const aluno = await prisma.aluno.findUnique({
            where: { id: parseInt(alunoId) }
        });

        if (!aluno) {
            return res.status(404).send('Aluno não encontrado.');
        }

        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Boletim de ${aluno.nome}</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Boletim de ${aluno.nome}</h1>
        `;

        if (!boletim) {
            html += `
            <p>Este aluno ainda não tem um boletim cadastrado.</p>
            <button onclick="location.href='/adicionar-boletim/${alunoId}'">Adicionar Boletim</button>
            `;
        } else {
            html += `
            <table>
                <thead>
                    <tr>
                        <th>Disciplina</th>
                        <th>Nota</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Artes</td>
                        <td>${boletim.artes}</td>
                    </tr>
                    <tr>
                        <td>Matemática</td>
                        <td>${boletim.matematica}</td>
                    </tr>
                    <tr>
                        <td>Ciências</td>
                        <td>${boletim.ciencias}</td>
                    </tr>
                    <tr>
                        <td>História</td>
                        <td>${boletim.historia}</td>
                    </tr>
                    <tr>
                        <td>Português</td>
                        <td>${boletim.portugues}</td>
                    </tr>
                    <tr>
                        <td>Geografia</td>
                        <td>${boletim.geografia}</td>
                    </tr>
                    <tr>
                        <td>Filosofia</td>
                        <td>${boletim.filosofia}</td>
                    </tr>
                    <tr>
                        <td>Educação Física</td>
                        <td>${boletim.educacao_fisica}</td>
                    </tr>
                </tbody>
            </table>
            <br>
            <button onclick="location.href='/atualizar-boletim/${boletim.id}'">Atualizar Boletim</button>
            
            <form action="/remover-boletim/${boletim.id}" method="POST" style="display:inline;">
                <button type="submit" class="btn-remover">Remover Boletim</button>
            </form>
            `;
        }

        html += `
            <br>
            <button onclick="location.href='/'">Voltar para a Lista</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar boletim.');
    }
});

app.post('/remover-boletim/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o boletim existe antes de tentar removê-lo
        const boletim = await prisma.boletim.findUnique({
            where: { id: parseInt(id) }
        });

        if (!boletim) {
            return res.status(404).send('Boletim não encontrado.');
        }

        
        await prisma.boletim.delete({
            where: { id: parseInt(id) }
        });

       
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao remover o boletim.');
    }
});

app.get('/atualizar-boletim/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const boletim = await prisma.boletim.findUnique({
            where: { id: parseInt(id) }
        });

        if (!boletim) {
            return res.status(404).send('Boletim não encontrado.');
        }

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Editar Boletim</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Editar Boletim</h1>
            <form action="/atualizar-boletim/${boletim.id}" method="POST">
                <label for="artes">Artes:</label><br>
                <input type="number" id="artes" name="artes" value="${boletim.artes}" step="0.1" min="0" max="10" required><br><br>

                <label for="matematica">Matemática:</label><br>
                <input type="number" id="matematica" name="matematica" value="${boletim.matematica}" step="0.1" min="0" max="10" required><br><br>

                <label for="ciencias">Ciências:</label><br>
                <input type="number" id="ciencias" name="ciencias" value="${boletim.ciencias}" step="0.1" min="0" max="10" required><br><br>

                <label for="historia">História:</label><br>
                <input type="number" id="historia" name="historia" value="${boletim.historia}" step="0.1" min="0" max="10" required><br><br>

                <label for="portugues">Português:</label><br>
                <input type="number" id="portugues" name="portugues" value="${boletim.portugues}" step="0.1" min="0" max="10" required><br><br>

                <label for="geografia">Geografia:</label><br>
                <input type="number" id="geografia" name="geografia" value="${boletim.geografia}" step="0.1" min="0" max="10" required><br><br>

                <label for="filosofia">Filosofia:</label><br>
                <input type="number" id="filosofia" name="filosofia" value="${boletim.filosofia}" step="0.1" min="0" max="10" required><br><br>

                <label for="educacao_fisica">Educação Física:</label><br>
                <input type="number" id="educacao_fisica" name="educacao_fisica" value="${boletim.educacao_fisica}" step="0.1" min="0" max="10" required><br><br>

                <button type="submit">Atualizar Boletim</button>
            </form>
            <br>
            <button onclick="location.href='/boletim/${boletim.alunoId}'">Voltar ao Boletim</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar formulário de edição.');
    }
});

app.post('/atualizar-boletim/:id', async (req, res) => {
    const { id } = req.params;
    const { artes, matematica, ciencias, historia, portugues, geografia, filosofia, educacao_fisica } = req.body;

   
    const notas = {
        artes: parseFloat(artes),
        matematica: parseFloat(matematica),
        ciencias: parseFloat(ciencias),
        historia: parseFloat(historia),
        portugues: parseFloat(portugues),
        geografia: parseFloat(geografia),
        filosofia: parseFloat(filosofia),
        educacao_fisica: parseFloat(educacao_fisica)
    };

 
    if (!validarNotas(notas)) {
        return res.status(400).send('Todas as notas devem estar entre 0 e 10.');
    }

    try {
   
        const boletimAtualizado = await prisma.boletim.update({
            where: { id: parseInt(id) },
            data: notas
        });


        res.redirect(`/boletim/${boletimAtualizado.alunoId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar boletim.');
    }
});

app.get('/associar-aluno-professor', async (req, res) => {
    try {
        const alunos = await prisma.aluno.findMany();
        const professores = await prisma.professor.findMany();

        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Associar Aluno a Professor</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu(req)} <!-- Passando req para gerarMenu -->
            <div class="form-container">
                <h2>Associar Aluno a Professor</h2>
                <form class="form-associacao" action="/associar-aluno-professor" method="POST">
                    <label for="alunoId">Aluno:</label><br>
                    <select id="alunoId" name="alunoId" required>
                        ${alunos.map(aluno => `<option value="${aluno.id}">${aluno.nome}</option>`).join('')}
                    </select><br><br>

                    <label for="professorId">Professor:</label><br>
                    <select id="professorId" name="professorId" required>
                        ${professores.map(professor => `<option value="${professor.id}">${professor.nome} (${professor.disciplina})</option>`).join('')}
                    </select><br><br>

                    <button type="submit">Associar</button>
                </form>
                <br>
                <button class="btn-voltar" onclick="location.href='/'">Voltar para a Lista</button>
            </div>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar formulário de associação.');
    }
});

app.post('/associar-aluno-professor', async (req, res) => {
    const { alunoId, professorId } = req.body;

    try {
        await prisma.aluno.update({
            where: { id: parseInt(alunoId) },
            data: {
                professores: {
                    connect: { id: parseInt(professorId) }
                }
            }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao associar aluno e professor.');
    }
});


app.get('/selecionar-aluno-boletim', async (req, res) => {
    try {
        const alunos = await prisma.aluno.findMany({
            include: { boletim: true } // Inclui o boletim do aluno
        });

        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Selecionar Aluno para Boletim</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${gerarMenu()}
            <h1>Selecionar Aluno para Boletim</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        alunos.forEach(aluno => {
            html += `
                <tr>
                    <td>${aluno.id}</td>
                    <td>${aluno.nome}</td>
                    <td>
                        <button onclick="location.href='/boletim/${aluno.id}'">Ver Boletim</button>
                        <button onclick="location.href='/adicionar-boletim/${aluno.id}'">Adicionar Boletim</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <br>
            <button onclick="location.href='/'">Voltar para a Lista</button>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar lista de alunos.');
    }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});