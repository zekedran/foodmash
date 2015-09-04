class DishType < ActiveRecord::Base
	has_many :combo_options
	has_many :dishes
	has_many :combo_dishes
	validates_uniqueness_of :name
end
