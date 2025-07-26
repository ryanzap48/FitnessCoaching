import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import exerciseImageMap from '../../../image-mapping/exerciseImageMap';
import exerciseVideoMap from '../../../video-mapping/exerciseVideoMap';

export default function CreateExercise() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [diagramUrl, setDiagramUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [instructions, setInstructions] = useState(['']);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const toggleSelection = (value, setFn, current) => {
        const isSelected = current.includes(value);
        if (isSelected) {
        setFn(current.filter(v => v !== value));
        } else {
        if (current.length >= 3) {
            const newSelection = [...current.slice(1), value];
            setFn(newSelection);
        } else {
            setFn([...current, value]);
        }
        }
    };

    const handleInstructionChange = (idx, value) => {
        const newInstructions = [...instructions];
        newInstructions[idx] = value;
        setInstructions(newInstructions);
    };

    const addInstruction = () => setInstructions([...instructions, '']);
    
    const removeInstruction = (idx) => {
        const newInstructions = instructions.filter((_, i) => i !== idx);
        setInstructions(newInstructions.length ? newInstructions : ['']);
    };

    const handleNameChange = (value) => {
        setName(value);
        setImageUrl('');
        const normalizedName = value.trim().toLowerCase();
        const mappedImage = exerciseImageMap[normalizedName];
        const mappedVideo = exerciseVideoMap[normalizedName];
        if (mappedImage && !imageUrl) {
            setImageUrl(mappedImage);
        }
        if (mappedVideo && !videoUrl) {
            setVideoUrl(mappedVideo);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const exerciseData = {
            name,
            description,
            categories,
            diagramUrl,
            imageUrl,
            videoUrl,
            instructions,
        };
        const res = await fetch('http://localhost:9000/exercises/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exerciseData),
        });

        const data = await res.json();
        if (res.ok) {
            setMessage('✅ Exercise created successfully!');
            setName('');
            setDescription('');
            setCategories([]);
            setDiagramUrl('');
            setImageUrl('');
            setVideoUrl('');
            setInstructions(['']);

            navigate('/adminexercises');
        } else {
            setMessage(`❌ ${data.message}`);
        }
    };

    const styles = {
        form: {  
            fontFamily: 'sans-serif',
        },
        input: {
            width: '97%',
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
        },
        button: {
            border: 'none',
            borderRadius: '4px',
            padding: '9px 20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '14px'
        },
        chip: (active) => ({
            padding: '0.5rem 1rem',
            margin: '0.25rem',
            borderRadius: '20px',
            border: '1px solid #ccc',
            background: active ? '#007bff' : '#e0e0e0',
            color: active ? '#fff' : '#000',
            cursor: 'pointer',
        }),
        message: {
            marginTop: '1rem',
            fontWeight: 'bold',
            color: message.startsWith('✅') ? 'green' : 'red',
        }
    };
    return (
        <div style={{ 
                padding: '1.5rem',
                margin: 'auto',
                display: 'flex',
                justifyContent: 'center'
                }}>
            <form onSubmit={handleSubmit} style={styles.form}>
               
                <input style={styles.input} placeholder="Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
                <textarea style={styles.input} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                
                <div><strong>Categories:</strong></div>
                {['Biceps', 'Triceps', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Forearms', 'Traps', 'Lats', 'Obliques'].map(c => (
                    <button type="button" key={c} style={styles.chip(categories.includes(c))} onClick={() => toggleSelection(c, setCategories, categories)}>
                        {categories.includes(c) ? `✓ ${c}` : c}
                    </button>
                ))}

                <input
                    style={styles.input}
                    placeholder="Optional Image URL (Overrides Default)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Optional Diagram URL (Overrides Default)"
                    value={diagramUrl}
                    onChange={(e) => setDiagramUrl(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Optional Video URL (Overrides Default)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                />

                <div style={{ marginTop: '1rem' }}><strong>Instructions:</strong></div>
                {instructions.map((instr, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input
                            style={{ ...styles.input, flex: 1 }}
                            placeholder={`Step ${idx + 1}`}
                            value={instr}
                            onChange={(e) => handleInstructionChange(idx, e.target.value)}
                            required
                        />
                        <button type="button" style={{ ...styles.button, backgroundColor: '#dc3545', color: '#fff' }} onClick={() => removeInstruction(idx)}>✖</button>
                    </div>
                ))}
                <button type="button" style={{ ...styles.button, backgroundColor: '#6c757d', color: '#fff' }} onClick={addInstruction}>+ Add Step</button>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap', // Optional: only needed if wrapping is expected
                    marginTop: '20px',
                    width: '100%', // Ensure the container takes full width
                }}>
                    <button type="submit" style={{ ...styles.button, backgroundColor: '#28a745', color: '#fff' }}>Submit Exercise</button>
                </div>
            
                {message && <p style={styles.message}>{message}</p>}
            </form>
        </div>
    );
}
