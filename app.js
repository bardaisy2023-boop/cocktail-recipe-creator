document.addEventListener('DOMContentLoaded', () => {
    const baseInput = document.getElementById('baseInput');
    const cocktailNameInput = document.getElementById('cocktailNameInput');
    const imageInput = document.getElementById('imageInput');
    const methodInput = document.getElementById('methodInput');
    const tasteNoteInput = document.getElementById('tasteNoteInput');
    
    const displayBase = document.getElementById('displayBase');
    const displayName = document.getElementById('displayName');
    const displayImage = document.getElementById('displayImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const displayIngredients = document.getElementById('displayIngredients');
    const displayMethod = document.getElementById('displayMethod');
    const displayTaste = document.getElementById('displayTaste');
    
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    const recipeCard = document.getElementById('recipeCard');
    const downloadBtn = document.getElementById('downloadBtn');

    // リアルタイムテキスト反映
    baseInput.addEventListener('input', (e) => {
        displayBase.textContent = e.target.value || 'Gin base';
    });

    cocktailNameInput.addEventListener('input', (e) => {
        displayName.textContent = e.target.value || 'カクテル名';
    });

    methodInput.addEventListener('input', (e) => {
        displayMethod.textContent = e.target.value || '-';
    });

    tasteNoteInput.addEventListener('input', (e) => {
        displayTaste.textContent = e.target.value || '-';
    });

    // 材料行の追加
    addIngredientBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `<input type="text" class="ingredient-input" placeholder="材料名・分量">`;
        ingredientsContainer.appendChild(row);
        row.querySelector('input').addEventListener('input', updateIngredients);
        updateIngredients();
    });

    ingredientsContainer.addEventListener('input', updateIngredients);

    function updateIngredients() {
        const inputs = ingredientsContainer.querySelectorAll('.ingredient-input');
        displayIngredients.innerHTML = '';

        inputs.forEach(input => {
            const val = input.value.trim();
            if (val) {
                const item = document.createElement('div');
                item.className = 'ingredient-item';
                item.innerHTML = `<span>${val}</span>`;
                displayIngredients.appendChild(item);
            }
        });

        if (displayIngredients.children.length === 0) {
            displayIngredients.innerHTML = '<div style="color: #666; font-size: 0.8rem;">材料が未入力です</div>';
        }
    }
    updateIngredients();

    // 写真選択時：切り抜きなしでそのままカードに反映
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                displayImage.src = event.target.result;
                displayImage.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // 画像保存処理 (html2canvas)
    downloadBtn.addEventListener('click', async () => {
        downloadBtn.textContent = '作成中...';
        downloadBtn.disabled = true;

        try {
            const canvas = await html2canvas(recipeCard, {
                scale: 2,
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