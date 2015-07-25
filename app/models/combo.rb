class Combo < ActiveRecord::Base
	has_many :combo_options, dependent: :destroy
	has_many :combo_option_dishes, through: :combo_options, dependent: :destroy
	validates :price, presence: true, numericality: {greater_than: 0}
end
