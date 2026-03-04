# デフォルトのタイマー設定を作成
TimerSetting.find_or_create_by(id: 1) do |setting|
  setting.work_duration = 25
  setting.break_duration = 5
  setting.long_break_duration = 15
  setting.sets = 4
  setting.notification_enabled = true
  setting.sound_enabled = true
  setting.auto_start_next = false
end

# デフォルトカテゴリを作成
categories = [
  { name: '仕事', color: '#3B82F6' },
  { name: '勉強', color: '#10B981' },
  { name: '趣味', color: '#F59E0B' },
  { name: '運動', color: '#EF4444' },
  { name: 'その他', color: '#8B5CF6' }
]

categories.each do |cat|
  Category.find_or_create_by(name: cat[:name]) do |category|
    category.color = cat[:color]
  end
end

puts "シードデータの作成が完了しました！"
puts "カテゴリ数: #{Category.count}"
puts "タイマー設定: #{TimerSetting.count}"

