document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('numberInput');
    const kanaInput = document.getElementById('kanaInput');
    const cocktailNameInput = document.getElementById('cocktailNameInput');
    const subtitleInput = document.getElementById('subtitleInput');
    const authorInput = document.getElementById('authorInput');
    const imageInput = document.getElementById('imageInput');
    
    const displayDate = document.getElementById('displayDate');
    const displayNumber = document.getElementById('displayNumber');
    const displayKana = document.getElementById('displayKana');
    const displayName = document.getElementById('displayName');
    const displaySubtext = document.getElementById('displaySubtext');
    const displayAuthor = document.getElementById('displayAuthor');
    const displayImage = document.getElementById('displayImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    
    const recipeCard = document.getElementById('recipeCard');
    const downloadBtn = document.getElementById('downloadBtn');

    // --- 当日の日付を自動取得してカードに反映 ---
    function setTodayDate() {
        const today = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = months[today.getMonth()];
        const d = today.getDate();
        const y = today.getFullYear();
        displayDate.textContent = `${m}.${d}.${y}`;
    }
    setTodayDate();

    // ナンバー（初期値をNo.000に、入力された数字を3桁ゼロ埋めに）
    numberInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) {
            displayNumber.textContent = 'No.000';
        } else {
            const paddedNum = String(val).padStart(3, '0');
            displayNumber.textContent = `No.${paddedNum}`;
        }
    });

    // 読み方（未入力でも高さを維持するため空文字を設定）
    kanaInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        displayKana.textContent = val;
    });

    // サブタイトル（未入力でも高さを維持するため空文字を設定）
    subtitleInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        displaySubtext.textContent = val;
    });

    // 作成者（入力された場合のみ「by: ○○○」を表示）
    authorInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
            displayAuthor.textContent = `by: ${val}`;
            displayAuthor.style.display = 'block';
        } else {
            displayAuthor.textContent = '';
            displayAuthor.style.display = 'none';
        }
    });

    // 日本語判定
    function isJapaneseChar(char) {
        const pattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/;
        return pattern.test(char);
    }

    // カクテル名フォント切り分け
    function formatCocktailName(text) {
        if (!text) return '<span class="font-en">ここにカクテル名</span>';

        let html = '';
        let currentType = null;
        let buffer = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const isJa = isJapaneseChar(char);
            const type = (isJa || (char >= '\uFF00' && char <= '\uffef')) ? 'ja' : 'en';

            if (currentType === null) {
                currentType = type;
                buffer += char;
            } else if (currentType === type) {
                buffer += char;
            } else {
                html += `<span class="font-${currentType}">${escapeHtml(buffer)}</span>`;
                currentType = type;
                buffer = char;
            }
        }
        if (buffer) {
            html += `<span class="font-${currentType}">${escapeHtml(buffer)}</span>`;
        }

        return html;
    }

    function escapeHtml(str) {
        return str.replace(/[&'`<>"]/g, (match) => ({
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
        }[match]));
    }

    cocktailNameInput.addEventListener('input', (e) => {
        const val = e.target.value;
        displayName.innerHTML = formatCocktailName(val);
    });

    // 写真選択 (HEIC対応)
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let imageFile = file;

        if (file.type === 'image/heic' || file.type === 'image/HEIC' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });
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

    // 画像保存処理（サイズ制限を一切設けず、そのままの高画質フルサイズで生成）
    downloadBtn.addEventListener('click', async () => {
        downloadBtn.textContent = '画像を作成中...';
        downloadBtn.disabled = true;

        try {
            const canvas = await html2canvas(recipeCard, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                windowWidth: recipeCard.scrollWidth,
                windowHeight: recipeCard.scrollHeight
            });

            const imgDataUrl = canvas.toDataURL('image/png');
            const filename = cocktailNameInput.value.trim() || 'cocktail_card';

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                
                const content = document.createElement('div');
                content.className = 'modal-content';
                
                const msg = document.createElement('p');
                msg.textContent = '画像を長押しして「写真に保存」してください';
                
                const img = document.createElement('img');
                img.src = imgDataUrl;
                img.alt = filename;
                img.className = 'modal-image';
                
                const closeBtn = document.createElement('button');
                closeBtn.textContent = '閉じる';
                closeBtn.className = 'modal-close-btn';
                closeBtn.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                });
                
                content.appendChild(msg);
                content.appendChild(img);
                content.appendChild(closeBtn);
                overlay.appendChild(content);
                document.body.appendChild(overlay);

                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        document.body.removeChild(overlay);
                    }
                });
            } else {
                const link = document.createElement('a');
                link.download = `${filename}.png`;
                link.href = imgDataUrl;
                link.click();
            }
        } catch (err) {
            console.error('画像保存エラー:', err);
            alert('画像の生成に失敗しました。');
        } finally {
            downloadBtn.textContent = '画像を保存する';
            downloadBtn.disabled = false;
        }
    });
});