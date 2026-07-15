try {
  if (localStorage.getItem('flowai-theme') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
} catch {
  // 儲存空間不可用時仍可正常切換本次瀏覽的主題。
}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  const themeLabel = themeToggle.querySelector('.theme-label');
  const modal = document.getElementById('signup-modal');
  const modalDialog = modal.querySelector('.modal-dialog');
  const signupForm = modal.querySelector('.signup-form');
  const signupSuccess = modal.querySelector('.signup-success');
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const signupButtons = document.querySelectorAll('.open-signup');
  const closeModalButtons = modal.querySelectorAll('[data-close-modal]');
  const courseToggleButtons = document.querySelectorAll('.course-toggle');
  const faqButtons = document.querySelectorAll('.faq-item > h3 button');
  let lastFocusedElement = null;

  const updateThemeControl = () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? '切換淺色模式' : '切換深色模式');
    themeIcon.textContent = isDark ? '☀' : '☾';
    themeLabel.textContent = isDark ? '淺色模式' : '深色模式';
  };

  updateThemeControl();

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

    if (nextTheme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else {
      delete document.documentElement.dataset.theme;
    }

    try {
      localStorage.setItem('flowai-theme', nextTheme);
    } catch {
      // 無法寫入時不影響當次切換。
    }

    updateThemeControl();
  });

  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '開啟導覽選單');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '關閉導覽選單' : '開啟導覽選單');
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      if (targetId === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      closeMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });

  courseToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const detail = document.getElementById(button.getAttribute('aria-controls'));
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      button.querySelector('span').textContent = isOpen ? '查看內容' : '收合內容';
      detail.classList.toggle('is-open', !isOpen);
    });
  });

  const clearFieldError = (input) => {
    input.removeAttribute('aria-invalid');
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    if (error) error.textContent = '';
  };

  const setFieldError = (input, message) => {
    input.setAttribute('aria-invalid', 'true');
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    if (error) error.textContent = message;
  };

  [nameInput, emailInput].forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
  });

  const resetSignupModal = () => {
    signupForm.reset();
    signupForm.hidden = false;
    signupSuccess.hidden = true;
    modalDialog.setAttribute('aria-labelledby', 'modal-title');
    clearFieldError(nameInput);
    clearFieldError(emailInput);
  };

  const openModal = (trigger) => {
    lastFocusedElement = trigger;
    resetSignupModal();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.setTimeout(() => modalDialog.focus(), 50);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedElement) lastFocusedElement.focus();
  };

  signupButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeMenu();
      openModal(button);
    });
  });

  closeModalButtons.forEach((button) => button.addEventListener('click', closeModal));

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFieldError(nameInput);
    clearFieldError(emailInput);

    let firstInvalidField = null;
    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameValue) {
      setFieldError(nameInput, '請輸入姓名');
      firstInvalidField = nameInput;
    }

    if (!emailValue) {
      setFieldError(emailInput, '請輸入 Email');
      firstInvalidField ||= emailInput;
    } else if (!emailPattern.test(emailValue)) {
      setFieldError(emailInput, '請輸入正確的 Email 格式，例如 name@example.com');
      firstInvalidField ||= emailInput;
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    signupForm.hidden = true;
    signupSuccess.hidden = false;
    modalDialog.setAttribute('aria-labelledby', 'success-title');
    signupSuccess.querySelector('[data-close-modal]').focus();
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();

    if (event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button, input, select, [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled') && element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const currentItem = button.closest('.faq-item');
      const wasOpen = currentItem.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((item) => {
        item.classList.remove('open');
        item.querySelector('button').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        currentItem.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
});
