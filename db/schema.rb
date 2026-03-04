# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_01_10_150802) do
  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tasks", force: :cascade do |t|
    t.integer "category_id", null: false
    t.string "name"
    t.datetime "start_time"
    t.datetime "end_time"
    t.integer "duration"
    t.integer "pomodoro_sets"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_tasks_on_category_id"
  end

  create_table "timer_settings", force: :cascade do |t|
    t.integer "work_duration", default: 25
    t.integer "break_duration", default: 5
    t.integer "long_break_duration", default: 15
    t.integer "sets", default: 4
    t.boolean "notification_enabled", default: true
    t.boolean "sound_enabled", default: true
    t.boolean "auto_start_next", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "tasks", "categories"
end
