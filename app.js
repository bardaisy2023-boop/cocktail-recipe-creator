document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('dateInput');
    const dateTextDisplay = document.getElementById('dateTextDisplay');
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
    const imageContainer = document.getElementById('imageContainer');
    const downloadBtn = document.getElementById('downloadBtn');

    let uploadedPhotoImg = null; // 読み込んだ写真Imageオブジェクトを保持

    // 初期空白
    displayKana.innerHTML = '&nbsp;';
    displayName.innerHTML = '&nbsp;';
    displaySubtext.innerHTML = '&nbsp;';

    // --- 日付フォーマット ---
    function updateCardDate(dateObj) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = months[dateObj.getMonth()];
        const d = dateObj.getDate();
        const y = dateObj.getFullYear();
        
        displayDate.textContent = `${m}.${d}.${y}`;
        
        if (dateTextDisplay) {
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            dateTextDisplay.value = `${yyyy}/${mm}/${dd}`;
        }
    }

    const today = new Date();
    if (dateInput) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    updateCardDate(today);

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
            displayNumber.textContent = val ? `No.${String(val).padStart(3, '0')}` : 'No.000';
        });
    }

    // 読み方
    if (kanaInput) {
        kanaInput.addEventListener('input', (e) => {
            const val = e.target.value;
            displayKana.innerHTML = val.trim() ? escapeHtml(val) : '&nbsp;';
        });
    }

    // サブタイトル
    if (subtitleInput) {
        subtitleInput.addEventListener('input', (e) => {
            const val = e.target.value;
            displaySubtext.innerHTML = val.trim() ? escapeHtml(val) : '&nbsp;';
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
                displayNameText.textContent = '';
                displayAuthor.style.display = 'none';
            }
        });
    }

    // 日本語文字判定
    function isJapaneseChar(char) {
        return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/.test(char);
    }

    // セグメント分割（日英混在フォント用）
    function splitTextSegments(text) {
        const segments = [];
        if (!text) return segments;
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
                segments.push({ type: currentType, text: buffer });
                currentType = type;
                buffer = char;
            }
        }
        if (buffer) {
            segments.push({ type: currentType, text: buffer });
        }
        return segments;
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
            if (!val || !val.trim()) {
                displayName.innerHTML = '&nbsp;';
                return;
            }
            const segs = splitTextSegments(val);
            displayName.innerHTML = segs.map(s => `<span class="font-${s.type}">${escapeHtml(s.text)}</span>`).join('');
        });
    }

    // 写真選択 (HEIC対応 & Imageオブジェクト生成)
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
                        quality: 0.92
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
                const dataUrl = event.target.result;
                displayImage.src = dataUrl;
                displayImage.style.display = 'block';
                if (imagePlaceholder) imagePlaceholder.style.display = 'none';

                const img = new Image();
                img.onload = () => {
                    uploadedPhotoImg = img;
                };
                img.src = dataUrl;
            };
            reader.readAsDataURL(imageFile);
        });
    }

    // 画像アセット読み込みヘルパー
    function loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    // Pure Canvas による完全自前合成エンジン（1200 x 1500 = 厳密 4:5）
    async function generateCardCanvas() {
        await document.fonts.ready;

        const W = 1200;
        const H = 1500; // 1200 * 1.25 = 厳密な4:5比率
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // プレビューの実際の寸法から、写真枠の相対位置・比率を1ピクセルの狂いもなく同期取得
        const cardRect = recipeCard.getBoundingClientRect();
        const imgBoxRect = imageContainer.getBoundingClientRect();

        const relImgX = (imgBoxRect.left - cardRect.left) / cardRect.width;
        const relImgY = (imgBoxRect.top - cardRect.top) / cardRect.height;
        const relImgW = imgBoxRect.width / cardRect.width;
        const relImgH = imgBoxRect.height / cardRect.height;

        const boxX = Math.round(W * relImgX);
        const boxY = Math.round(H * relImgY);
        const boxW = Math.round(W * relImgW);
        const boxH = Math.round(H * relImgH);

        // 1. 背景グラデーション
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#4d4442');
        grad.addColorStop(0.45, '#312b2a');
        grad.addColorStop(1, '#181616');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 2. カクテル写真（object-fit: cover の完全数学的再現）
        if (uploadedPhotoImg) {
            const srcW = uploadedPhotoImg.naturalWidth;
            const srcH = uploadedPhotoImg.naturalHeight;
            const srcRatio = srcW / srcH;
            const targetRatio = boxW / boxH;

            let cropW, cropH, cropX, cropY;
            if (srcRatio > targetRatio) {
                cropH = srcH;
                cropW = srcH * targetRatio;
                cropX = (srcW - cropW) / 2;
                cropY = 0;
            } else {
                cropW = srcW;
                cropH = srcW / targetRatio;
                cropX = 0;
                cropY = (srcH - cropH) / 2;
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(boxX, boxY, boxW, boxH);
            ctx.clip();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(uploadedPhotoImg, cropX, cropY, cropW, cropH, boxX, boxY, boxW, boxH);
            ctx.restore();
        }

        // 3. フレーム画像（screenブレンド＋色調補正の再現）
        const frameImg = await loadImage('frame.png');
        if (frameImg) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.98;
            ctx.filter = 'drop-shadow(0 0 3px #fbf1ef) sepia(100%) hue-rotate(330deg) saturate(30%) brightness(1.05)';
            ctx.drawImage(frameImg, 0, 0, W, H);
            ctx.restore();
        }

        // スケール係数（基準幅 340px に対する 1200px の倍率）
        const scale = W / cardRect.width;

        // 4. 最上部の日付とナンバー
        ctx.save();
        ctx.fillStyle = '#d4af37';
        ctx.font = `${Math.round(8.32 * scale)}px "Questrial", sans-serif`;
        ctx.textBaseline = 'top';
        const topY = Math.round(22 * scale);
        const sidePad = Math.round(28 * scale);

        ctx.textAlign = 'left';
        ctx.fillText(displayDate.textContent, sidePad, topY);

        ctx.textAlign = 'right';
        ctx.fillText(displayNumber.textContent, W - sidePad, topY);
        ctx.restore();

        // 5. ヘッダータイトル（Your Own Original / COCKTAIL）
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        ctx.fillStyle = '#fbf1ef';
        ctx.font = `${Math.round(10.88 * scale)}px "Great Vibes", cursive`;
        ctx.fillText('Your Own Original', W / 2, Math.round(35 * scale));

        ctx.fillStyle = '#d4af37';
        ctx.font = `${Math.round(25.92 * scale)}px "Playfair Display", serif`;
        ctx.fillText('COCKTAIL', W / 2, Math.round(45 * scale));
        ctx.restore();

        // 6. 読み方・カクテル名・サブタイトル
        const kanaVal = kanaInput.value.trim();
        const nameVal = cocktailNameInput.value.trim();
        const subVal = subtitleInput.value.trim();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (kanaVal) {
            ctx.fillStyle = '#fbf1ef';
            ctx.font = `${Math.round(8.96 * scale)}px "Noto Sans JP", sans-serif`;
            ctx.fillText(kanaVal, W / 2, Math.round(84 * scale));
        }

        if (nameVal) {
            const segs = splitTextSegments(nameVal);
            const fontSize = Math.round(17.28 * scale);
            let totalWidth = 0;

            const measuredSegs = segs.map(seg => {
                ctx.font = seg.type === 'ja'
                    ? `700 ${fontSize}px "Noto Sans JP", sans-serif`
                    : `400 ${fontSize}px "Questrial", sans-serif`;
                const w = ctx.measureText(seg.text).width;
                totalWidth += w;
                return { ...seg, width: w };
            });

            let curX = (W - totalWidth) / 2;
            const nameY = Math.round(103 * scale);
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fbf1ef';

            measuredSegs.forEach(seg => {
                ctx.font = seg.type === 'ja'
                    ? `700 ${fontSize}px "Noto Sans JP", sans-serif`
                    : `400 ${fontSize}px "Questrial", sans-serif`;
                ctx.fillText(seg.text, curX, nameY);
                curX += seg.width;
            });
        }

        if (subVal) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fbf1ef';
            ctx.font = `${Math.round(8.96 * scale)}px "Noto Sans JP", sans-serif`;
            ctx.fillText(subVal, W / 2, Math.round(122 * scale));
        }
        ctx.restore();

        // 7. 左下の作成者表示（入力時のみ）
        const authorVal = authorInput.value.trim();
        if (authorVal) {
            ctx.save();
            ctx.fillStyle = 'rgba(251, 241, 239, 0.9)';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'left';
            const authorFontSize = Math.round(7.84 * scale);
            const authorX = Math.round(28 * scale);
            const authorY = H - Math.round(18 * scale);

            ctx.font = `400 ${authorFontSize}px "Questrial", sans-serif`;
            const prefix = 'by: ';
            const prefixW = ctx.measureText(prefix).width;
            ctx.fillText(prefix, authorX, authorY);

            ctx.font = `400 ${authorFontSize}px "Noto Sans JP", sans-serif`;
            ctx.fillText(authorVal, authorX + prefixW, authorY);
            ctx.restore();
        }

        // 8. フッターロゴ（Bar DAISY）
        const logoImg = await loadImage('rogo.PNG');
        if (logoImg) {
            ctx.save();
            ctx.globalAlpha = 0.95;
            const logoW = Math.round(38 * scale);
            const logoH = Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth));
            const logoX = Math.round((W - logoW) / 2);
            const logoY = H - Math.round(12 * scale) - logoH;
            ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
            ctx.restore();
        }

        // 9. 右下のデイジーイラスト
        const daisyImg = await loadImage('daisy-icon.png');
        if (daisyImg) {
            ctx.save();
            const daisyW = Math.round(26 * scale);
            const daisyH = Math.round(daisyW * (daisyImg.naturalHeight / daisyImg.naturalWidth));
            const daisyCenterX = W - Math.round(14 * scale) - daisyW / 2;
            const daisyCenterY = H - Math.round(10 * scale) - daisyH / 2;

            ctx.translate(daisyCenterX, daisyCenterY);
            ctx.rotate((-10 * Math.PI) / 180);
            ctx.filter = 'brightness(2.5) drop-shadow(0 0 4px rgba(0,0,0,0.9))';
            ctx.drawImage(daisyImg, -daisyW / 2, -daisyH / 2, daisyW, daisyH);
            ctx.restore();
        }

        return canvas;
    }

    // 保存ボタン処理
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            downloadBtn.textContent = '画像を作成中...';
            downloadBtn.disabled = true;

            try {
                const canvas = await generateCardCanvas();
                const imgDataUrl = canvas.toDataURL('image/png', 1.0);
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
                console.error('画像生成エラー:', err);
                alert('画像の生成に失敗しました。');
            } finally {
                downloadBtn.textContent = '画像を保存する';
                downloadBtn.disabled = false;
            }
        });
    }
});