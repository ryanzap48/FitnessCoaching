import { useState, useEffect } from 'react';
import ingredientImageMap from '../../../image-mapping/IngredientImageMap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const RecipeModal = ({ 
  recipe, 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 568);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 568);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !recipe) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const modalStyle = {
    position: 'relative',
    background: 'rgb(228, 222, 222)',
    borderRadius: '10px',
    maxWidth: '600px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    overflowY: 'auto',
  };

  return (
    <>
      <div style={overlayStyle}>
        <div style={{
          ...modalStyle,
          width: isMobile ? '95vw' : '600px',
          maxWidth: isMobile ? '95vw' : '600px',
          margin: isMobile ? '10px' : '0'
        }}>
          <button
            onClick={onClose}
            style={{ 
              float: 'right', 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              cursor: 'pointer' 
            }}
          >×</button>
          
          <div style={{
            margin: '7px', 
            background: 'rgb(255, 255, 255)', 
            borderRadius: '10px', 
            height: isMobile ? 'auto' : '335px', 
            minHeight: isMobile ? '250px' : '335px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', 
              height: isMobile ? 'auto' : '255px',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'center' : 'stretch'
            }}> 
              <img
                src={recipe.imageUrl}
                alt=''
                style={{ 
                  width: isMobile ? '85%' : '210px', 
                  height: isMobile ? '85%' : '210px', 
                  cursor: 'pointer', 
                  borderRadius: '8px', 
                  marginLeft: isMobile ? '0' : '20px', 
                  marginTop: isMobile ? '20px' : '30px',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                marginLeft: isMobile ? '10px' : '30px', 
                marginRight: isMobile ? '10px' : '30px',
                marginTop: isMobile ? '15px' : '0'
              }}> 
                <h4 style={{ 
                  fontFamily: 'Open Sans, sans-serif', 
                  marginTop: isMobile ? '10px' : '60px', 
                  marginBottom: '0px', 
                  fontWeight: '100', 
                  fontSize: isMobile ? '20px' : '22px',
                  textAlign: 'center'
                }}>{recipe.name}</h4>
                <p style={{ 
                  padding: '4px 20px', 
                  background: 'rgb(34, 226, 217, 0.4)', 
                  fontSize: '13px', 
                  borderRadius: '15px', 
                  margin: '6px 0px'
                }}>{recipe.category}</p>
                
                <div
                  style={{
                    height: isMobile ? 'auto' : '4.5em',
                    overflow: isMobile ? 'visible' : 'hidden',
                    textOverflow: isMobile ? 'initial' : 'ellipsis',
                    display: isMobile ? 'block' : '-webkit-box',
                    WebkitLineClamp: isMobile ? 'none' : 3,
                    WebkitBoxOrient: isMobile ? 'initial' : 'vertical',
                    marginTop: '8px',
                    fontSize: '15px',
                    lineHeight: '1.5em',
                    textAlign: 'center',
                    padding: isMobile ? '0 10px' : '0'
                  }}
                >
                  "{recipe.description}"
                </div>

                {!isMobile && recipe.description.split(' ').length > 30 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullDescription(true);
                    }}
                    style={{
                      marginTop: '0px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#007bff',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    See more
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: isMobile ? '5px' : '10px', 
                  marginTop: '10px', 
                  marginBottom: '10px', 
                  fontSize: isMobile ? '13px' : '15px',
                  flexDirection: isMobile ? 'column' : 'row',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: 0, fontWeight: '100' }}>⏲ Estimated Time: {recipe.estimatedTime}m</h4>
                  <h4 style={{ margin: 0, fontWeight: '100' }}>👥 Servings: {recipe.servings}</h4>
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '15px' : '35px', 
              margin: '0px 30px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: isMobile ? '10px 0' : '0'
            }}>
              {recipe.foodClass.map((item, idx) => {
                const iconMap = {
                    "Low Carb": "🌾",
                    "High Protein": "🍗",
                    "Nut Free": "🥜",
                    "Vegan": "🥕",
                    "Vegetarian": "🥦",
                    "Gluten Free": "🚫",
                    "Dairy Free": "🥛",
                    "Paleo": "🍖",
                    "Keto": "🥩",
                    "Whole30": "🍽️",
                    "Low Fat": "🧈",
                    "Sugar Free": "🍬",
                    "Low Sodium": "🧂",
                    "High Fiber": "🌽",
                    "Heart Healthy": "❤️",
                    "Diabetic Friendly": "🩸",
                    "Anti-Inflammatory": "🌿",
                    "Plant Based": "🌱",
                    "Raw": "🥒",
                    "Meal Prep Friendly": "📦",
                    "Quick & Easy": "⚡",
                    "Budget Friendly": "💵",
                    "Kid Friendly": "🧒",
                    "Comfort Food": "🍲",
                    "High Calorie": "🔥"
                };

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{
                      width: isMobile ? '35px' : '40px',
                      height: isMobile ? '35px' : '40px',
                      borderRadius: '50%',
                      border: '1px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '16px' : '20px'
                    }}>
                      {iconMap[item] || "❓"}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '10px' : '12px',
                      color: '#333',
                      marginTop: '6px'
                    }}>
                      {item}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '20px' : '80px', 
            marginTop: '10px', 
            margin: '7px', 
            justifyContent: 'center', 
            padding: isMobile ? '15px 10px' : '10px 20px', 
            background: 'rgb(255, 255, 255)', 
            borderRadius: '10px', 
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            {[
              { label: 'Calories', value: recipe.calories, unit: 'cal' },
              { label: 'Protein', value: recipe.protein, unit: 'g' },
              { label: 'Carbs', value: recipe.carbs, unit: 'g' },
              { label: 'Fats', value: recipe.fats, unit: 'g' }
            ].map((item, index) => (
              <div key={index} style={{ textAlign: 'center', flex: isMobile ? '1 1 40%' : 'initial' }}>
                <div style={{ fontWeight: '400', fontSize: isMobile ? '18px' : '20px', color: '#0d0d25' }}>
                  {item.value}
                  <span style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: '400', marginLeft: '3px' }}>{item.unit}</span>
                </div>
                <div style={{ fontSize: isMobile ? '11px' : '13px', color: '#666'}}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            margin: '7px', 
            background: 'rgb(255, 255, 255)', 
            borderRadius: '10px',  
            minHeight: isMobile ? '200px' : '285px', 
            maxHeight: isMobile ? '40vh' : '40vh',
            overflowY: 'auto', 
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
          }}> 
            <div style={{
              position: 'relative',
              borderBottom: '2px solid #ccc',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '10px',
              flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}>
              {['Ingredients', 'Instructions', 'Nutrition'].map((tab) => (
                <div key={tab} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActiveTab(tab)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: activeTab === tab ? '#007bff' : '#333',
                      padding: isMobile ? '8px 2rem' : '8px 3.5rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: '0.3s',
                      position: 'relative',
                      zIndex: 1,
                      fontSize: isMobile ? '14px' : '16px'
                    }}
                  >
                    {tab}
                  </button>
                  {activeTab === tab && (
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#007bff',
                      borderRadius: '2px'
                    }} />
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ padding: isMobile ? '0px 15px' : '0px 20px'}}>
              {activeTab === 'Ingredients' && (
                <div>
                  <h5>Unit: Imperial US </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recipe.ingredients.map((ingredient, idx) => {
                      const imageSrc = ingredientImageMap[ingredient.toLowerCase()] || null;
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            width: isMobile ? '30px' : '40px', 
                            height: isMobile ? '30px' : '40px', 
                            marginRight: '12px', 
                            flexShrink: 0 
                          }}>
                            {imageSrc ? (
                              <img src={imageSrc} alt={ingredient} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%' }} />
                            )}
                          </div>
                          <div style={{ 
                            flex: 1, 
                            borderBottom: '1px solid #ccc', 
                            paddingBottom: '6px',
                            fontSize: isMobile ? '14px' : '16px'
                          }}>
                            {ingredient}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <style>{`
                ol li::marker {
                  font-weight: bold;
                }
              `}</style>
              
              {activeTab === 'Instructions' && (
                <div style={{ 
                  padding: '0px 0px', 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word', 
                  lineHeight: '1.4'
                }}>
                  <ol>
                    {recipe.instructions.map((item, idx) => (
                      <li style={{ 
                        paddingBottom: '1rem', 
                        maxWidth: 'calc(100% - 20px)',
                        fontSize: isMobile ? '14px' : '16px'
                      }} key={idx}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}

              {activeTab === 'Nutrition' && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: isMobile ? '15px' : '30px', 
                  justifyContent: 'center', 
                  gap: isMobile ? '30px' : '80px',
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'row' : 'column', 
                    gap: isMobile ? '15px' : '20px', 
                    minWidth: '100px',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}>
                    {[
                      { label: 'Protein', color: '#4285F4', grams: recipe.protein, percent: Math.round((recipe.protein * 4 / recipe.calories) * 100) },
                      { label: 'Carbs', color: '#0F9D58', grams: recipe.carbs, percent: Math.round((recipe.carbs * 4 / recipe.calories) * 100) },
                      { label: 'Fat', color: '#FBBC05', grams: recipe.fats, percent: Math.round((recipe.fats * 9 / recipe.calories) * 100) }
                    ].map((item, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: isMobile ? 'center' : 'flex-start',
                        textAlign: isMobile ? 'center' : 'left'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></div>
                          <span style={{ fontWeight: '500', fontSize: isMobile ? '12px' : '14px' }}>{item.label} ({item.percent}%)</span>
                        </div>
                        <div style={{ 
                          marginLeft: isMobile ? '0' : '17px', 
                          fontSize: isMobile ? '14px' : '16px', 
                          fontWeight: 'bold', 
                          color: '#333',
                          marginTop: isMobile ? '2px' : '0'
                        }}>
                          {item.grams} g
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ 
                    width: isMobile ? '8rem' : '10rem', 
                    position: 'relative'
                  }}>
                    
                    <Doughnut
                      data={{
                        labels: ['Protein', 'Carbs', 'Fat'],
                        datasets: [{
                          data: [
                            recipe.protein * 4,
                            recipe.carbs * 4,
                            recipe.fats * 9
                          ],
                          backgroundColor: ['#4285F4', '#0F9D58', '#FBBC05'],
                          borderWidth: 0
                        }]
                      }}
                      options={{
                        cutout: '70%',
                        plugins: {
                          legend: { display: false }
                        }
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: '#333'
                    }}>
                      <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 'bold' }}>
                        {recipe.calories}
                        <span style={{ fontSize: isMobile ? '11px' : '13px', marginLeft: '3px', fontWeight: 'normal' }}>cal</span>
                      </div>
                      <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#888' }}>Calories</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFullDescription && (
        <div style={{
          ...overlayStyle,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: isMobile ? '15px 20px' : '20px 30px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            maxWidth: isMobile ? '90vw' : '80vw',
            width: 'fit-content',
            height: 'auto',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowFullDescription(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <p style={{ 
              margin: '15px 0px', 
              fontSize: isMobile ? '14px' : '16px', 
              lineHeight: '1.5' 
            }}>
              "{recipe.description}"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeModal;