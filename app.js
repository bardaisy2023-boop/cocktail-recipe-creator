document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('dateInput');
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
    const displayNameText = document.getElementById('displayNameText');
    const displayImage = document.getElementById('displayImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    
    const recipeCard = document.getElementById('recipeCard');
    const downloadBtn = document.getElementById('downloadBtn');

    // --- 日付をフォーマットしてカードに反映する関数 ---
    function updateCardDate(dateObj) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = months[dateObj.getMonth()];
        const d = dateObj.getDate();
        const y = dateObj.getFullYear();
        displayDate.textContent = `${m}.${d}.${y}`;
    }

    // --- 初期化時に当日の日付をセット ---
    const today = new Date();
    if (dateInput) {
        // YYYY-MM-DD形式に変換してinputの初期値に設定
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    updateCardDate(today);

    // --- 日付変更時のイベントリスナー ---
    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const parts = val.split('-');
                const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                updateCardDate(selectedDate);
            }
        });
    }

    // ナンバー
    if (numberInput) {
        numberInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (!val) {
                displayNumber.textContent = 'No.000';
            } else {
                const paddedNum = String(val).padStart(3, '0');
                displayNumber.textContent = `No.${paddedNum}`;
            }
        });
    }

    // 読み方
    if (kanaInput) {
        kanaInput.addEventListener('input', (e) => {
            displayKana.textContent = e.target.value || '読み方';
        });
    }

    // サブタイトル
    if (subtitleInput) {
        subtitleInput.addEventListener('input', (e) => {
            displaySubtext.textContent = e.target.value || 'あればサブタイトル';
        });
    }

    // 作成者
    if (authorInput) {
        authorInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) {
                displayNameText.textContent = val;
                displayAuthor.style.display = 'block';
            } else {
                displayNameText.textContent = '作成者名';
                displayAuthor.style.display = 'block';
            }
        });
    }

    // 日本語判定
    function isJapaneseChar(char) {
        const pattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/;
        return pattern.test(char);
    }

    // カクテル名フォント切り分け
    function formatCocktailName(text) {
        if (!text) return '<span class="font-ja">ここにカクテル名</span>';

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

    if (cocktailNameInput) {
        cocktailNameInput.addEventListener('input', (e) => {
            const val = e.target.value;
            displayName.innerHTML = formatCocktailName(val);
        });
    }

    // 写真選択 (HEIC対応)
    if (imageInput) {
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
    }

    // 画像保存処理
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            downloadBtn.textContent = '画像を作成中...';
            downloadBtn.disabled = true;

            try {
                const canvas = await html2canvas(recipeCard, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: null,
                    logging: false,
                    scrollX: 0,
                    scrollY: 0
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
    }
});