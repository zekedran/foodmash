class Combo < ActiveRecord::Base
	before_save {|combo| write_attribute(:name, combo.name.split.each{|s| s[0] = s[0].upcase}.join(' '))}
	belongs_to :packaging_centre
	has_many :combo_dishes, dependent: :destroy
	has_many :combo_options, dependent: :destroy
	has_many :combo_option_dishes, through: :combo_options, dependent: :destroy
	has_many :orders, as: :product
	validates :price, presence: true, numericality: {greater_than: -1}
	validates_presence_of :name, :group_size, :packaging_centre_id, :category
	before_save :check_for_availability
	before_save :update_label
	before_save :ensure_picture_is_encoded
	before_save :calculate_price
	before_save :allow_only_one_customizable_combo
	before_destroy :ensure_combo_not_referenced

	private
	def allow_only_one_customizable_combo
		combos = Combo.where(packaging_centre_id: self.packaging_centre_id) if self.packaging_centre_id
		allow = true
		if combos.present?
			customizable_combos = combos.where(customizable: true)
			customizable_combos = customizable_combos.where.not(id: self.id) if self.id
			allow = false if customizable_combos.present? and self.customizable == true
		end
		return allow
	end

	def ensure_picture_is_encoded
	 	decoded_pic = URI.decode(self.picture) if self.picture.present?
		self.picture = URI.encode(decoded_pic) if self.picture.present?
	   	return true
	end

	def calculate_price
		price = 0
		if self.combo_dishes.present?
			self.combo_dishes.each do |combo_dish|
				price += combo_dish.dish.price * combo_dish.min_count
			end
		end

		if self.combo_options.present?
			compulsory_combo_options = self.combo_options.where.not(min_count: 0)
			compulsory_combo_options.each do |combo_option|
				combo_option_price_list = []
				if combo_option.dishes.present?
					combo_option.dishes.each do |dish|
						combo_option_price_list.append(dish.price * combo_option.min_count)
					end
				end
				price += combo_option_price_list.present? ? combo_option_price_list.min : 0.0
			end
			non_compulsory_combo_options = self.combo_options.where(min_count: 0)
			non_compulsory_combo_option_price_list = []
			non_compulsory_combo_options.each do |combo_option|
				if combo_option.dishes.present?
					combo_option.dishes.each do |dish|
						non_compulsory_combo_option_price_list.append(dish.price * 1)
					end
				end
			end
			price += non_compulsory_combo_option_price_list.present? ? non_compulsory_combo_option_price_list.min : 0.0
		end
		self.price = price
		return true
	end

	def check_for_availability
		if self.combo_options or self.combo_dishes	
			if self.combo_options and self.combo_options.count > 0
				combo_options_list = []
				self.combo_options.each do |combo_option|
				 	if combo_option.dishes.pluck(:available).include? true
				 	  combo_options_list.append true
				 	else
				 	  combo_options_list.append false
				 	end
				end
				self.available = (combo_options_list.uniq == [true])
			end

			if self.combo_dishes and self.combo_dishes.count > 0
				combo_dishes_list = []
				self.combo_dishes.each do |combo_dish|
					if combo_dish.dish.available == true
						combo_dishes_list.append true
					else
						combo_dishes_list.append false
					end
				end
				self.available = (combo_dishes_list.uniq == [true])
			end
		else
			self.available = false
		end
		return true
	end

	def update_label
		dishes = []
		self.combo_dishes.each {|combo_dish| dishes << combo_dish.dish}
		self.combo_options.each { |combo_option| dishes << combo_option.dishes }
		labels = dishes.flatten.map(&:label)
		if labels.include? "non-veg"
			self.label = "non-veg"
		elsif labels.include? "egg"
			self.label =  "egg"
		else
			self.label =  "veg"
		end
		return true
	end

	def ensure_combo_not_referenced
		if orders.empty?
			return true
		else
			errors.add(:base, "Orders present!")
			return false
		end
	end
end
