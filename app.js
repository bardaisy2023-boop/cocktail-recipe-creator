document.addEventListener('DOMContentLoaded', () => {
    // フォーム要素
    const baseInput = document.getElementById('baseInput');
    const cocktailNameInput = document.getElementById('cocktailNameInput');
    const imageInput = document.getElementById('imageInput');
    const methodInput = document.getElementById('methodInput');
    const tasteNoteInput = document.getElementById('tasteNoteInput');
    const ingredientsList = document.getElementById('ingredientsList');
    const addIngredientBtn = document.getElementById('addIngredientBtn');

    // カード表示要素
    const cardBase = document.getElementById('cardBase');
    const cardName = document.getElementById('cardName');
    const cardImage = document.getElementById('cardImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const cardIngredients = document.getElementById('cardIngredients');
    const cardMethod = document.getElementById('cardMethod');
    const cardTaste = document.getElementById('cardTaste');
    const recipeCard = document.getElementById('recipeCard');
    const downloadBtn = document.getElementById('downloadBtn');

    // リアルタイム反映：テキスト入力
    baseInput.addEventListener('input', (e) => {
        cardBase.textContent = e.target.value || 'Gin base';
    });

    cocktailNameInput.addEventListener('input', (e) => {
        cardName.textContent = e.target.value || 'カクテル名';
    });

    methodInput.addEventListener('input', (e) => {
        cardMethod.textContent = e.target.value || '-';
    });

    tasteNoteInput.addEventListener('input', (e) => {
        cardTaste.textContent = e.target.value || '-';
    });

    // 材料行の追加
    addIngredientBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" class="ingredient-name" placeholder="材料名（例: ソーダ）">
        `;
        ingredientsList.appendChild(row);

        row.querySelector('input').addEventListener('input', updateIngredients);
        updateIngredients();
    });

    // 材料のリアルタイム監視
    ingredientsList.addEventListener('input', updateIngredients);

    function updateIngredients() {
        const inputs = ingredientsList.querySelectorAll('.ingredient-name');
        cardIngredients.innerHTML = '';

        inputs.forEach(input => {
            const val = input.value.trim();
            if (val) {
                const item = document.createElement('div');
                item.className = 'card-ingredient-item';
                item.innerHTML = `<span>${val}</span>`;
                cardIngredients.appendChild(item);
            }
        });

        if (cardIngredients.children.length === 0) {
            cardIngredients.innerHTML = '<div style="color: #666; font-size: 0.85rem;">材料が未入力です</div>';
        }
    }
    updateIngredients(); // 初期実行

    // 画像選択時の処理（トリミングなし・そのまま全体表示）
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                cardImage.src = event.target.result;
                cardImage.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // 画像として保存する処理 (html2canvas)
    downloadBtn.addEventListener('click', async () => {
        downloadBtn.textContent = '画像を作成中...';
        downloadBtn.disabled = true;

        try {
            const canvas = await html2canvas(recipeCard, {
                scale: 2, // 高解像度化
                useCORS: true,
                backgroundColor: '#2b2523'
            });

            const imgDataUrl = canvas.toDataURL('image/png');
            const filename = cocktailNameInput.value.trim() || 'cocktail_recipe';

            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = imgDataUrl;
            link.click();
        } catch (err) {
            console.error('画像保存エラー:', err);
            alert('画像の生成に失敗しました。');
        } finally {
            downloadBtn.textContent = '画像を保存する';
            downloadBtn.disabled = false;
        }
    });
});
