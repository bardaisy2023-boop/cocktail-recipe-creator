document.addEventListener('DOMContentLoaded', () => {
  // DOM要素の取得
  const cocktailNameInput = document.getElementById('cocktailName');
  const baseTypeSelect = document.getElementById('baseType');
  const imageInput = document.getElementById('imageInput');
  const ingredientsList = document.getElementById('ingredientsList');
  const addIngBtn = document.getElementById('addIngBtn');
  const methodInput = document.getElementById('method');
  const tasteNoteInput = document.getElementById('tasteNote');
  const memoInput = document.getElementById('memo');

  // カード表示用DOM要素
  const recipeCard = document.getElementById('recipeCard');
  const cardName = document.getElementById('cardName');
  const cardBase = document.getElementById('cardBase');
  const cardImageContainer = document.getElementById('cardImageContainer');
  const cardImage = document.getElementById('cardImage');
  const cardIngredients = document.getElementById('cardIngredients');
  const cardMethod = document.getElementById('cardMethod');
  const cardTaste = document.getElementById('cardTaste');
  const cardMemo = document.getElementById('cardMemo');
  const downloadBtn = document.getElementById('downloadBtn');

  // クロップ（切り抜き）用DOM要素
  const cropModal = document.getElementById('cropModal');
  const cropTargetImage = document.getElementById('cropTargetImage');
  const cancelCropBtn = document.getElementById('cancelCropBtn');
  const applyCropBtn = document.getElementById('applyCropBtn');
  let cropper = null;

  // 保存用モーダルDOM要素
  const imageModal = document.getElementById('imageModal');
  const closeModal = document.getElementById('closeModal');
  const modalImageContainer = document.getElementById('modalImageContainer');
  const sizeBtns = document.querySelectorAll('.size-btn');

  // 1. カクテル名
  if (cocktailNameInput && cardName) {
    cocktailNameInput.addEventListener('input', (e) => {
      cardName.textContent = e.target.value.trim() || 'カクテル名';
    });
  }

  // 2. ベース種類
  if (baseTypeSelect && cardBase) {
    baseTypeSelect.addEventListener('change', (e) => {
      cardBase.textContent = e.target.value;
    });
  }

  // 3. 画像選択 & クロップ（切り抜き）起動
  if (imageInput) {
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        cardImageContainer.style.display = 'none';
        cardImage.src = '';
        return;
      }

      try {
        let imageBlob = file;
        // HEIC画像変換対応
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic') {
          if (typeof heic2any !== 'undefined') {
            const converted = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.8
            });
            imageBlob = Array.isArray(converted) ? converted[0] : converted;
          }
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          cropTargetImage.src = event.target.result;
          cropModal.style.display = 'flex';

          // 既存のCropperインスタンス破棄
          if (cropper) {
            cropper.destroy();
          }

          // Cropper.js 初期化 (横長〜スクエアに合わせやすい 16:9 や 4:3、自由指定可能)
          cropper = new Cropper(cropTargetImage, {
            aspectRatio: 16 / 9,
            viewMode: 1,
            autoCropArea: 0.9,
            background: false
          });
        };
        reader.readAsDataURL(imageBlob);
      } catch (error) {
        console.error('画像読み込みエラー:', error);
        alert('画像の読み込みに失敗しました。');
      }
    });
  }

  // クロップ適用（切り抜き決定）
  if (applyCropBtn) {
    applyCropBtn.addEventListener('click', () => {
      if (!cropper) return;

      const canvas = cropper.getCroppedCanvas({
        width: 800, // 高解像度保存
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      cardImage.src = canvas.toDataURL('image/jpeg', 0.9);
      cardImageContainer.style.display = 'flex';
      
      cropModal.style.display = 'none';
      cropper.destroy();
      cropper = null;
    });
  }

  // クロップキャンセル
  if (cancelCropBtn) {
    cancelCropBtn.addEventListener('click', () => {
      cropModal.style.display = 'none';
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      imageInput.value = ''; // ファイル入力クリア
    });
  }

  // 4. 材料リストのリアルタイム更新
  function updateIngredients() {
    if (!cardIngredients || !ingredientsList) return;

    cardIngredients.innerHTML = '';
    const rows = ingredientsList.querySelectorAll('.ingredient-row');
    let hasContent = false;

    rows.forEach(row => {
      const nameInput = row.querySelector('.ing-name');
      const amountInput = row.querySelector('.ing-amount');
      
      const name = nameInput ? nameInput.value.trim() : '';
      const amount = amountInput ? amountInput.value.trim() : '';

      if (name || amount) {
        hasContent = true;
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span> <span>${amount}</span>`;
        cardIngredients.appendChild(li);
      }
    });

    if (!hasContent) {
      cardIngredients.innerHTML = '<li><span>材料名</span> <span>分量</span></li>';
    }
  }

  function attachIngredientEvents(container) {
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', updateIngredients);
    });
  }

  if (ingredientsList) {
    attachIngredientEvents(ingredientsList);
  }

  // 5. 材料追加ボタン
  if (addIngBtn && ingredientsList) {
    addIngBtn.addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'ingredient-row';
      row.innerHTML = `
        <input type="text" class="ing-name" placeholder="材料">
        <input type="text" class="ing-amount" placeholder="分量">
      `;
      ingredientsList.appendChild(row);
      attachIngredientEvents(row);
    });
  }

  // 6. 作り方
  if (methodInput && cardMethod) {
    methodInput.addEventListener('input', (e) => {
      cardMethod.textContent = e.target.value.trim() || '-';
    });
  }

  // 7. 味わい
  if (tasteNoteInput && cardTaste) {
    tasteNoteInput.addEventListener('input', (e) => {
      cardTaste.textContent = e.target.value.trim() || '-';
    });
  }

  // 8. メモ
  if (memoInput && cardMemo) {
    memoInput.addEventListener('input', (e) => {
      cardMemo.textContent = e.target.value.trim();
    });
  }

  // 9. サイズ切り替え
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const size = btn.getAttribute('data-size');
      if (recipeCard) {
        if (size === 'story') {
          recipeCard.classList.remove('size-feed');
          recipeCard.classList.add('size-story');
        } else {
          recipeCard.classList.remove('size-story');
          recipeCard.classList.add('size-feed');
        }
      }
    });
  });

  // 10. 保存用モーダル閉じる
  if (closeModal && imageModal) {
    closeModal.addEventListener('click', () => {
      imageModal.style.display = 'none';
    });
  }
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        imageModal.style.display = 'none';
      }
    });
  }

  // 11. 画像ダウンロード/保存
  if (downloadBtn && recipeCard) {
    downloadBtn.addEventListener('click', async () => {
      if (typeof html2canvas === 'undefined') {
        alert('ライブラリを読み込み中です。少々お待ちください。');
        return;
      }

      downloadBtn.textContent = '生成中...';
      downloadBtn.disabled = true;

      try {
        const canvas = await html2canvas(recipeCard, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#342e2c',
          logging: false
        });

        const imgDataUrl = canvas.toDataURL('image/png');
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && modalImageContainer && imageModal) {
          modalImageContainer.innerHTML = `<img src="${imgDataUrl}" alt="完成カード画像">`;
          imageModal.style.display = 'flex';
        } else {
          const filename = cocktailNameInput ? cocktailNameInput.value.trim() || 'cocktail-recipe' : 'cocktail-recipe';
          const isStory = recipeCard.classList.contains('size-story');
          const suffix = isStory ? 'story' : 'feed';

          const link = document.createElement('a');
          link.download = `${filename}_${suffix}.png`;
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