document.addEventListener('DOMContentLoaded', function() {
    
    // Dán URL Web App của bạn vào đây
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZuw43JdZ6l-dsdWMf1U3SvvTtLb-LsNqNCltmdaAb2dVCe8OUlreBFUwPzAxS7ZDk0Q/exec";

    // --- CẤU HÌNH (Không thay đổi) ---
    const STUDENT_ID_EXPIRATION_MINUTES = 60;
    const APPRAISAL_DIMENSIONS = [
        { id: 'goal_congruence', label: '1. Tình huống này giúp bạn đạt được điều bạn muốn, hay đang cản trở bạn?', minLabel: '-1: Cản trở mục tiêu của tôi', maxLabel: '+1: Giúp tôi đạt được mục tiêu' },
        { id: 'attainment_expectancy', label: '2. Tại thời điểm đó, bạn có hy vọng sẽ đạt được mục tiêu ban đầu không?', minLabel: '-1: Hoàn toàn không còn hy vọng', maxLabel: '+1: Vẫn rất hy vọng đạt được' },
        { id: 'agency_self', label: '3. Ai hoặc điều gì là nguyên nhân chính gây ra tình huống này?', minLabel: '-1: Do người khác hoặc hoàn cảnh', maxLabel: '+1: Do chính tôi' },
        { id: 'intentionality', label: '4. Bạn nghĩ người gây ra chuyện này đã cố tình làm vậy, hay chỉ là vô ý?', minLabel: '-1: Chỉ là vô ý/không cố tình', maxLabel: '+1: Hoàn toàn cố ý' },
        { id: 'control_now', label: '5. Ngay tại thời điểm đó, bạn cảm thấy mình kiểm soát được tình hình đến mức nào?', minLabel: '-1: Hoàn toàn mất kiểm soát', maxLabel: '+1: Hoàn toàn kiểm soát được' },
        { id: 'coping_potential', label: '6. Bạn có tin rằng mình đủ sức mạnh để đối phó với hậu quả của chuyện này không?', minLabel: '-1: Cảm thấy không thể đối phó', maxLabel: '+1: Tự tin có thể đối phó' },
        { id: 'certainty', label: '7. Bạn có chắc chắn về những gì sắp xảy ra tiếp theo không?', minLabel: '-1: Rất mơ hồ, không chắc chắn', maxLabel: '+1: Rất rõ ràng, chắc chắn' },
        { id: 'predictability', label: '8. Sự việc này xảy ra có bất ngờ với bạn không, hay bạn đã lường trước được nó?', minLabel: '-1: Vô cùng bất ngờ', maxLabel: '+1: Đã lường trước được' },
        { id: 'novelty', label: '9. Bạn đã bao giờ trải qua một tình huống tương tự như thế này trước đây chưa?', minLabel: '-1: Hoàn toàn mới lạ với tôi', maxLabel: '+1: Rất quen thuộc với tôi' },
        { id: 'norm_compat', label: '10. Bạn có cảm thấy hành động trong tình huống này là sai trái hay đúng đắn không?', minLabel: '-1: Hành động này là sai trái', maxLabel: '+1: Hành động này là đúng đắn' },
        { id: 'self_moral', label: '11. Hành động của bạn trong chuyện này khiến bạn cảm thấy tự hào hay hổ thẹn?', minLabel: '-1: Thấy hành động của mình đáng trách', maxLabel: '+1: Thấy hành động của mình đáng khen' },
        { id: 'other_moral', label: '12. Bạn đánh giá hành động của người khác trong chuyện này là tốt hay xấu?', minLabel: '-1: Hành động của họ là đúng đắn', maxLabel: '+1: Hành động của họ là sai trái' },
        { id: 'social_eval', label: '13. Bạn nghĩ sự việc này ảnh hưởng đến hình ảnh của bạn trong mắt người khác ra sao?', minLabel: '-1: Làm xấu đi hình ảnh của tôi', maxLabel: '+1: Nâng cao hình ảnh của tôi' },
        { id: 'other_impact', label: '14. Hành động của bạn đã giúp đỡ hay làm hại đến người khác?', minLabel: '-1: Gây hại cho người khác', maxLabel: '+1: Mang lại lợi ích cho người khác' },
        { id: 'effort', label: '15. Bạn có nghĩ mình sẽ phải tốn rất nhiều công sức để giải quyết hậu quả của nó không?', minLabel: '-1: Hầu như không cần nỗ lực', maxLabel: '+1: Cần nỗ lực rất lớn' },
        { id: 'urgency', label: '16. Bạn có cảm thấy mình cần phải hành động ngay lập tức không?', minLabel: '-1: Không cần vội, từ từ giải quyết', maxLabel: '+1: Cần hành động ngay lập tức' },
        { id: 'obstruction_facilitation', label: '17. Bạn cảm thấy hoàn cảnh xung quanh đang gây khó khăn hay tạo thuận lợi cho bạn?', minLabel: '-1: Hoàn cảnh đang cản trở tôi', maxLabel: '+1: Hoàn cảnh đang hỗ trợ tôi' },
        { id: 'future_controllability', label: '18. Bạn có tin rằng mình có thể thay đổi được kết quả của chuyện này trong tương lai không?', minLabel: '-1: Không thể thay đổi được nữa', maxLabel: '+1: Vẫn có thể thay đổi được' }
    ];

    const form = document.getElementById('appraisal-form');
    const participantIdSpan = document.getElementById('participant-id');
    let studentId = manageStudentId();
    participantIdSpan.textContent = studentId;

    populateDropdown('stimulus-id', 
        [...Array(10).keys()].map(i => `video_${String(i + 1).padStart(2, '0')}`), 
        [...Array(10).keys()].map(i => `recall_${String(i + 1).padStart(2, '0')}`)
    );
    populateDropdown('trial-id', [...Array(9).keys()].map(i => i + 1));
    
    createEmotionSelectors();
    createAppraisalSliders();

    form.addEventListener('submit', handleSubmit);
    document.getElementById('reset-btn').addEventListener('click', handleReset);

    // --- CÁC HÀM LOGIC ---

    function manageStudentId() {
        const now = new Date().getTime();
        let studentData = JSON.parse(localStorage.getItem('studentData'));
        if (studentData && (now < studentData.expiry)) {
            studentData.expiry = now + STUDENT_ID_EXPIRATION_MINUTES * 60 * 1000;
            localStorage.setItem('studentData', JSON.stringify(studentData));
            return studentData.id;
        } else {
            const newId = `SV_${now.toString().slice(-6)}_${Math.random().toString(36).substr(2, 5)}`;
            const newExpiry = now + STUDENT_ID_EXPIRATION_MINUTES * 60 * 1000;
            localStorage.setItem('studentData', JSON.stringify({ id: newId, expiry: newExpiry }));
            return newId;
        }
    }

    function populateDropdown(elementId, ...optionGroups) {
        const select = document.getElementById(elementId);
        select.innerHTML = '<option value="" disabled selected>-- Chọn --</option>';
        optionGroups.forEach(group => {
            group.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val;
                select.appendChild(option);
            });
        });
    }

    function createEmotionSelectors() {
        const container = document.getElementById('emotions-container');
        const emotions = ['Fear', 'Joy', 'Sadness', 'Anger'];
        const emotionSelects = []; 
        for (let i = 1; i <= 4; i++) {
            const group = document.createElement('div');
            group.className = 'emotion-group';
            const label = document.createElement('label');
            label.textContent = `Cảm xúc ${i}:`;
            group.appendChild(label);
            const select = document.createElement('select');
            select.id = `emotion-${i}`;
            select.innerHTML = `<option value="">-- Không có --</option>`;
            emotions.forEach(e => select.innerHTML += `<option value="${e.toLowerCase()}">${e}</option>`);
            group.appendChild(select);
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'slider-wrapper';
            sliderWrapper.style.marginTop = '10px';
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `intensity-${i}`;
            slider.min = 0;
            slider.max = 100;
            slider.value = 0; 
            slider.disabled = true;
            sliderWrapper.appendChild(slider);
            const valueSpan = document.createElement('span');
            valueSpan.className = 'slider-value';
            valueSpan.textContent = '0';
            sliderWrapper.appendChild(valueSpan);
            group.appendChild(sliderWrapper);
            container.appendChild(group);
            emotionSelects.push(select); 
            select.addEventListener('change', () => {
                slider.disabled = !select.value;
                slider.value = 0;
                valueSpan.textContent = '0';
                updateEmotionOptions(emotionSelects);
            });
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
            });
        }
    }

    function updateEmotionOptions(selects) {
        const selectedValues = new Set();
        selects.forEach(s => {
            if (s.value) {
                selectedValues.add(s.value);
            }
        });
        selects.forEach(currentSelect => {
            const currentSelectedValue = currentSelect.value;
            for (const option of currentSelect.options) {
                if (selectedValues.has(option.value) && option.value !== currentSelectedValue) {
                    option.disabled = true;
                } else {
                    option.disabled = false;
                }
            }
        });
    }

    function createAppraisalSliders() {
        const container = document.getElementById('appraisal-sliders-container');
        APPRAISAL_DIMENSIONS.forEach(dim => {
            const group = document.createElement('div');
            group.className = 'slider-group';
            group.innerHTML = `
                <label for="${dim.id}">${dim.label}</label>
                <div class="slider-labels">
                    <span>${dim.minLabel}</span>
                    <span>${dim.maxLabel}</span>
                </div>
                <div class="slider-wrapper">
                    <input type="range" id="${dim.id}" name="${dim.id}" min="-1" max="1" value="0" step="0.01">
                    <span class="slider-value">0.00</span>
                </div>
            `;
            container.appendChild(group);
            const slider = group.querySelector('input[type="range"]');
            const valueSpan = group.querySelector('.slider-value');
            slider.addEventListener('input', () => {
                valueSpan.textContent = parseFloat(slider.value).toFixed(2);
            });
        });
    }
    
    // ==========================================================
    // ===== CÁC THAY ĐỔI NẰM Ở 3 HÀM DƯỚI ĐÂY =====
    // ==========================================================

    /**
     * Hàm này chứa logic reset form, không có hộp thoại xác nhận.
     */
    function performReset() {
        form.reset();
        document.querySelectorAll('.slider-value').forEach(span => span.textContent = '0.00');
        document.querySelectorAll('#emotions-container .slider-value').forEach(span => span.textContent = '0');
        const emotionSelects = document.querySelectorAll('#emotions-container select');
        emotionSelects.forEach(select => {
            const slider = document.getElementById(select.id.replace('emotion', 'intensity'));
            slider.disabled = true;
            slider.value = 0;
        });
        updateEmotionOptions(Array.from(emotionSelects));
    }

    /**
     * Hàm này dành cho nút "Làm lại", sẽ hỏi xác nhận trước khi reset.
     */
    function handleReset() {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ thông tin đã nhập không?")) {
            performReset();
        }
    }
    
    /**
     * Hàm gửi dữ liệu và tự động reset sau khi thành công.
     */
    async function sendDataToGoogleSheet(data) {
        const submitBtn = document.getElementById('submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                redirect: 'follow'
            });
            alert("Gửi dữ liệu thành công! Cảm ơn bạn đã tham gia.");
            performReset(); // Gọi trực tiếp hàm reset không cần hỏi
        } catch (error) {
            console.error('Error:', error);
            alert("Đã có lỗi xảy ra khi gửi dữ liệu. Vui lòng thử lại.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
    
    function handleSubmit(event) {
        event.preventDefault();
        
        let isEmotionSelected = false;
        for (let i = 1; i <= 4; i++) {
            if (document.getElementById(`emotion-${i}`).value) {
                isEmotionSelected = true;
                break;
            }
        }
        if (!isEmotionSelected) {
            alert("Bạn phải chọn ít nhất một cảm xúc nổi bật để hoàn tất.");
            return; 
        }

        const data = {
            timestamp: new Date().toISOString(),
            participant_id: studentId,
            stimulus_id: document.getElementById('stimulus-id').value,
            trial_id: document.getElementById('trial-id').value,
        };
        let emotions = [];
        let intensities = [];
        for (let i = 1; i <= 4; i++) {
            const emotion = document.getElementById(`emotion-${i}`).value;
            if (emotion) {
                emotions.push(emotion);
                intensities.push(document.getElementById(`intensity-${i}`).value);
            }
        }
        data.primary_emotions = emotions.join(';');
        data.intensity_self_report = intensities.join(';');
        APPRAISAL_DIMENSIONS.forEach(dim => {
            data[dim.id] = document.getElementById(dim.id).value;
        });
        
        sendDataToGoogleSheet(data);
    }
});
