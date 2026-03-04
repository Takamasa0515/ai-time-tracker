import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display", "label", "progressCircle", "startBtn", "pauseBtn", "taskName", "taskList"]
  static values = {
    workDuration: Number,
    breakDuration: Number
  }

  connect() {
    this.mode = 'pomodoro' // 'countup' or 'pomodoro'
    this.timerState = 'idle' // 'idle', 'running', 'paused'
    this.pomodoroPhase = 'work' // 'work' or 'break'
    this.seconds = 0
    this.totalSeconds = this.workDurationValue * 60
    this.selectedCategoryId = null
    this.currentTaskId = null
    this.startTime = null
    this.pomodoroSets = 0
    
    this.updateDisplay()
    this.updateProgressCircle()
  }

  switchToCountUp() {
    this.reset()
    this.mode = 'countup'
    this.labelTarget.textContent = 'カウントアップモード'
    this.updateProgressCircle()
  }

  switchToPomodoro() {
    this.reset()
    this.mode = 'pomodoro'
    this.pomodoroPhase = 'work'
    this.totalSeconds = this.workDurationValue * 60
    this.labelTarget.textContent = '作業時間'
    this.updateDisplay()
    this.updateProgressCircle()
  }

  start() {
    if (this.timerState === 'running') return
    
    if (!this.taskNameTarget.value.trim()) {
      alert('作業名を入力してください')
      return
    }

    this.timerState = 'running'
    this.startBtnTarget.style.display = 'none'
    this.pauseBtnTarget.style.display = 'inline-flex'
    
    if (!this.startTime) {
      this.startTime = new Date()
    }

    this.interval = setInterval(() => {
      if (this.mode === 'countup') {
        this.seconds++
      } else {
        this.seconds++
        if (this.seconds >= this.totalSeconds) {
          this.completePhase()
        }
      }
      this.updateDisplay()
      this.updateProgressCircle()
    }, 1000)
  }

  pause() {
    if (this.timerState !== 'running') return
    
    this.timerState = 'paused'
    clearInterval(this.interval)
    this.startBtnTarget.style.display = 'inline-flex'
    this.pauseBtnTarget.style.display = 'none'
    this.labelTarget.textContent = '一時停止中'
  }

  reset() {
    this.timerState = 'idle'
    clearInterval(this.interval)
    this.seconds = 0
    this.startTime = null
    this.currentTaskId = null
    
    if (this.mode === 'pomodoro') {
      this.pomodoroPhase = 'work'
      this.totalSeconds = this.workDurationValue * 60
      this.labelTarget.textContent = '作業時間'
    } else {
      this.labelTarget.textContent = 'カウントアップモード'
    }
    
    this.startBtnTarget.style.display = 'inline-flex'
    this.pauseBtnTarget.style.display = 'none'
    this.updateDisplay()
    this.updateProgressCircle()
  }

  async completePhase() {
    clearInterval(this.interval)
    
    if (this.pomodoroPhase === 'work') {
      // 作業完了 - タスクを保存
      await this.saveTask()
      this.pomodoroSets++
      
      // 通知
      this.showNotification('作業完了！', '休憩時間です')
      this.playSound()
      
      // 休憩フェーズへ
      this.pomodoroPhase = 'break'
      this.seconds = 0
      this.totalSeconds = this.breakDurationValue * 60
      this.labelTarget.textContent = '休憩時間'
      this.updateProgressCircle()
      
      // 自動で次を開始（オプション）
      setTimeout(() => this.start(), 1000)
    } else {
      // 休憩完了
      this.showNotification('休憩完了！', '次の作業を始めましょう')
      this.playSound()
      
      // 作業フェーズへ
      this.pomodoroPhase = 'work'
      this.seconds = 0
      this.totalSeconds = this.workDurationValue * 60
      this.labelTarget.textContent = '作業時間'
      this.startTime = null
      this.updateProgressCircle()
      
      this.timerState = 'idle'
      this.startBtnTarget.style.display = 'inline-flex'
      this.pauseBtnTarget.style.display = 'none'
    }
  }

  async saveTask() {
    const endTime = new Date()
    const duration = Math.floor((endTime - this.startTime) / 1000)
    
    const taskData = {
      task: {
        name: this.taskNameTarget.value.trim(),
        category_id: this.selectedCategoryId,
        start_time: this.startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: duration,
        pomodoro_sets: this.mode === 'pomodoro' ? 1 : 0
      }
    }

    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        const task = await response.json()
        this.addTaskToList(task)
      }
    } catch (error) {
      console.error('タスク保存エラー:', error)
    }
  }

  selectCategory(event) {
    // すべてのカテゴリボタンのスタイルをリセット
    document.querySelectorAll('[data-category-id]').forEach(btn => {
      btn.classList.remove('btn-primary')
      btn.classList.add('btn-secondary')
    })
    
    // 選択されたカテゴリをハイライト
    event.currentTarget.classList.remove('btn-secondary')
    event.currentTarget.classList.add('btn-primary')
    
    this.selectedCategoryId = event.currentTarget.dataset.categoryId
  }

  async duplicateTask(event) {
    const taskId = event.currentTarget.dataset.taskId
    
    try {
      const response = await fetch(`/tasks/duplicate/${taskId}`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      })

      if (response.ok) {
        const task = await response.json()
        this.taskNameTarget.value = task.name
        this.selectedCategoryId = task.category_id
        alert('作業を複製しました')
      }
    } catch (error) {
      console.error('複製エラー:', error)
    }
  }

  async deleteTask(event) {
    if (!confirm('この作業を削除しますか？')) return
    
    const taskId = event.currentTarget.dataset.taskId
    
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        }
      })

      if (response.ok) {
        event.currentTarget.closest('.card').remove()
      }
    } catch (error) {
      console.error('削除エラー:', error)
    }
  }

  addTaskToList(task) {
    const taskHTML = `
      <div class="card fade-in" style="padding: 1rem; border-left: 4px solid ${task.category?.color || '#8B5CF6'};">
        <div class="flex justify-between items-center">
          <div style="flex: 1;">
            <h4 class="font-semibold">${task.name}</h4>
            <p class="text-sm text-muted">
              <i class="fas fa-tag"></i> ${task.category?.name || '未分類'}
              <span style="margin-left: 1rem;">
                <i class="fas fa-clock"></i> ${(task.duration / 60.0).toFixed(1)}分
              </span>
              ${task.pomodoro_sets > 0 ? `<span style="margin-left: 1rem;"><i class="fas fa-tomato"></i> ${task.pomodoro_sets}セット</span>` : ''}
            </p>
          </div>
          <div class="flex gap-sm">
            <button class="btn-icon btn-secondary" data-action="click->timer#duplicateTask" data-task-id="${task.id}">
              <i class="fas fa-copy"></i>
            </button>
            <button class="btn-icon btn-danger" data-action="click->timer#deleteTask" data-task-id="${task.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
    
    this.taskListTarget.insertAdjacentHTML('afterbegin', taskHTML)
  }

  updateDisplay() {
    const minutes = Math.floor(this.seconds / 60)
    const secs = this.seconds % 60
    this.displayTarget.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  updateProgressCircle() {
    const circumference = 2 * Math.PI * 140
    
    if (this.mode === 'countup') {
      // カウントアップモードでは進捗を表示しない
      this.progressCircleTarget.style.strokeDashoffset = circumference
    } else {
      // ポモドーロモードでは残り時間を表示
      const progress = this.seconds / this.totalSeconds
      const offset = circumference * (1 - progress)
      this.progressCircleTarget.style.strokeDashoffset = offset
      
      // 作業/休憩で色を変更
      if (this.pomodoroPhase === 'work') {
        this.progressCircleTarget.style.stroke = 'url(#gradient)'
      } else {
        this.progressCircleTarget.style.stroke = '#10b981'
      }
    }
  }

  showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' })
        }
      })
    }
  }

  playSound() {
    // 簡単なビープ音（Web Audio API）
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }
}
