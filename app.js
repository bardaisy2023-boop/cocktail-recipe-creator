document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('numberInput');
    const cocktailNameInput = document.getElementById('cocktailNameInput');
    const imageInput = document.getElementById('imageInput');
    
    const displayNumber = document.getElementById('displayNumber');
    const displayName = document.getElementById('displayName');
    const displayImage = document.getElementById('displayImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    
    const recipeCard = document.getElementById('recipeCard');
    const downloadBtn = document.getElementById('downloadBtn');

    // ナンバー（数字のみ入力で「No.」を自動付与）
    numberInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        displayNumber.textContent = val ? `No.${val}` : 'No.90';
    });

    // カクテル名
    cocktailNameInput.addEventListener('input', (e) => {
        displayName.textContent = e.target.value || 'カクテル名';
    });

    // 写真選択時：HEIC形式に対応して変換＆プレビュー表示
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let imageFile = file;

        // HEIC/HEIF形式の場合はJPEGに変換
        if (file.type === 'image/heic' || file.type === 'image/HEIC' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });
                // 複数返る場合があるので配列の先頭を取得
                imageFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            } catch (err) {
                console.error('HEIC変換エラー:', err);
                alert('HEIC画像の変換に失敗しました。');
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            displayImage.src = event.target.result;
            displayImage.style.display = 'block';
            imagePlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(imageFile);
    });

    // 画像保存処理 (html2canvas)
    downloadBtn.addEventListener('click', async () => {
        downloadBtn.textContent = '画像を作成中...';
        downloadBtn.disabled = true;

        try {
            const canvas = await html2canvas(recipeCard, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#2b2523'
            });

            const imgDataUrl = canvas.toDataURL('image/png');
            const filename = cocktailNameInput.value.trim() || 'cocktail_card';

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