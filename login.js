// Importa as funções necessárias do Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Variáveis globais fornecidas pelo ambiente Canvas
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // Inicializa o Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Elementos da interface
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const anonymousLoginButton = document.getElementById('anonymousLoginButton');
    const errorMessageDisplay = document.getElementById('errorMessage');

    // Função para exibir mensagens de erro
    function showError(message) {
        errorMessageDisplay.textContent = message;
    }

    // Função para limpar mensagens de erro
    function clearError() {
        errorMessageDisplay.textContent = '';
    }

    // Função para lidar com o login/criação de conta
    async function handleLogin() {
        clearError();
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Por favor, preencha e-mail e senha.");
            return;
        }

        try {
            // Tenta fazer login
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login bem-sucedido!");
            // Redirecionar para a página principal do jogo após o login
            window.location.href = 'index.html'; // Redireciona para a homepage
        } catch (error) {
            // Se o login falhar, tenta criar uma nova conta
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    console.log("Conta criada e login bem-sucedido!");
                    // Redirecionar para a página principal do jogo após a criação e login
                    window.location.href = 'index.html'; // Redireciona para a homepage
                    
                    // Opcional: Criar um documento inicial para o novo usuário no Firestore
                    const userId = auth.currentUser.uid;
                    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/playerData/coins`);
                    await setDoc(userDocRef, {
                        estamina: 0,
                        mana: 0,
                        ataque: 0,
                        teleporte: 0,
                        ressurreicao: 0,
                        xp: 0
                    }, { merge: true }); // merge: true para não sobrescrever se já existir
                    console.log("Dados iniciais do usuário salvos no Firestore.");

                } catch (createError) {
                    if (createError.code === 'auth/email-already-in-use') {
                        showError("Este e-mail já está em uso. Tente fazer login.");
                    } else if (createError.code === 'auth/weak-password') {
                        showError("Senha muito fraca (mínimo 6 caracteres).");
                    } else {
                        showError(`Erro ao criar conta: ${createError.message}`);
                        console.error("Erro ao criar conta:", createError);
                    }
                }
            } else {
                showError(`Erro de login: ${error.message}`);
                console.error("Erro de login:", error);
            }
        }
    }

    // Função para lidar com o login anônimo
    async function handleAnonymousLogin() {
        clearError();
        try {
            await signInAnonymously(auth);
            console.log("Login anônimo bem-sucedido!");
            // Redirecionar para a página principal do jogo
            window.location.href = 'index.html'; // Redireciona para a homepage

            // Opcional: Criar um documento inicial para o usuário anônimo no Firestore
            const userId = auth.currentUser.uid;
            const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/playerData/coins`);
            await setDoc(userDocRef, {
                estamina: 0,
                mana: 0,
                ataque: 0,
                teleporte: 0,
                ressurreicao: 0,
                xp: 0
            }, { merge: true });
            console.log("Dados iniciais do usuário anônimo salvos no Firestore.");

        } catch (error) {
            showError(`Erro ao entrar como convidado: ${error.message}`);
            console.error("Erro ao entrar como convidado:", error);
        }
    }

    // Tenta fazer login com o token inicial fornecido pelo ambiente Canvas
    if (initialAuthToken) {
        try {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Login automático com token inicial bem-sucedido.");
            // Redirecionar para a página principal do jogo se o login automático funcionar
            window.location.href = 'index.html'; // Redireciona para a homepage

        } catch (error) {
            console.warn("Falha no login automático com token inicial, permitindo login manual ou anônimo.", error);
            // Se o token falhar, o usuário ainda pode tentar login manual ou anônimo
        }
    } else {
        // Se não houver token inicial, o usuário precisa fazer login manual ou anônimo
        console.log("Nenhum token de autenticação inicial fornecido. Login manual ou anônimo necessário.");
    }

    // Adiciona os "ouvintes de evento" aos botões
    loginButton.addEventListener('click', handleLogin);
    anonymousLoginButton.addEventListener('click', handleAnonymousLogin);
});
