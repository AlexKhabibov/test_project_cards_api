import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Импортируем иконки лайков

const CatGallery = () => {
  const [cats, setCats] = useState([]); // Состояние для хранения всех котиков
  const [loading, setLoading] = useState(true); // Состояние для загрузки
  const [error, setError] = useState(null); // Состояние для ошибок
  const [selectedTab, setSelectedTab] = useState('all'); // Состояние для выбранной вкладки: 'all' или 'liked'

  // Загружаем котиков из localStorage при монтировании компонента
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=10');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Получаем список лайкнутых котиков из localStorage
        const likedCats = JSON.parse(localStorage.getItem('likedCats')) || [];

        // Добавляем поле liked для каждого котика, проверяем, лайкнут ли он
        const catsWithLikes = data.map((cat) => ({
          ...cat,
          liked: likedCats.includes(cat.id), // Если котик в списке лайкнутых, то liked = true
        }));

        setCats(catsWithLikes); // Сохраняем котиков с полем liked
      } catch (error) {
        setError(error.message); // Если ошибка, сохраняем её в состоянии
      } finally {
        setLoading(false); // Завершаем процесс загрузки
      }
    };

    fetchCats();
  }, []);

  // Функция для обработки клика по кнопке лайка
  const handleLikeToggle = (id) => {
    setCats((prevCats) => {
      const updatedCats = prevCats.map((cat) =>
        cat.id === id ? { ...cat, liked: !cat.liked } : cat
      );

      // Сохраняем обновленное состояние лайкнутых котиков в localStorage
      const likedCats = updatedCats.filter((cat) => cat.liked).map((cat) => cat.id);
      localStorage.setItem('likedCats', JSON.stringify(likedCats)); // Сохраняем в localStorage

      return updatedCats;
    });
  };

  // Фильтрация котиков в зависимости от выбранной вкладки
  const filteredCats = selectedTab === 'liked' ? cats.filter((cat) => cat.liked) : cats;

  if (loading) {
    return <div>Загрузка...</div>; // Пока загружаем данные, показываем "Загрузка..."
  }

  if (error) {
    return <div>Ошибка: {error}</div>; // Если произошла ошибка, показываем её
  }

  return (
    <div>
      {/* Хедер с кнопками */}
      <header className="header">
        <button
          className={`tab-button ${selectedTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTab('all')}
        >
          Все котики
        </button>
        <button
          className={`tab-button ${selectedTab === 'liked' ? 'active' : ''}`}
          onClick={() => setSelectedTab('liked')}
        >
          Любимые котики
        </button>
      </header>

      <div className="cat-gallery">
        <div className="cat-images">
          {filteredCats.map((cat) => (
            <div key={cat.id} className="cat-card">
              <img src={cat.url} alt={`Cat ${cat.id}`} width="225" height="225" />
              <div
                className={`like-container ${cat.liked ? 'liked' : ''}`}
                onClick={() => handleLikeToggle(cat.id)}
              >
                {cat.liked ? <FaHeart className="liked-heart" /> : <FaRegHeart />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatGallery;