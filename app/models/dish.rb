class Dish < ActiveRecord::Base
  before_save {|dish| write_attribute(:name, dish.name.split.each{|s| s[0] = s[0].upcase}.join(' '))}
  belongs_to :restaurant
  belongs_to :dish_type
  belongs_to :cuisine
  has_many :combos, through: :combo_dishes
  has_many :combo_options, through: :combo_option_dishes
  has_many :combo_option_dishes
  has_many :combo_dishes
  has_many :order_items, as: :item
  validates :restaurant_id, presence: true
  validates :dish_type_id, presence: true
  validates :label, presence: true
  validates :price, presence: true
  before_destroy :ensure_dish_not_referenced
  before_save :ensure_picture_is_encoded
  after_save :update_combos_on_save

  def belongs_to_combos
	  combos = []

    if self.combo_options.present?
      self.combo_options.each {|combo_option| 
        if combo_option.combo.present?
          combos << combo_option.combo 
        end 
    } 
    end

    if self.combos.present?
      combos << self.combos
    end

    return combos.flatten.uniq
  end

  private

  def ensure_picture_is_encoded
    decoded_pic = URI.decode(self.picture) if self.picture.present?
    self.picture = URI.encode(decoded_pic) if self.picture.present?
    return true
  end

  def update_combos_on_save
    combos = []

    if self.combo_options.present?
      self.combo_options.each {|combo_option| 
        if combo_option.combo.present?
          combos << combo_option.combo 
        end
      }
    end

    if self.combos.present?
      combos << self.combos
    end

    combos = combos.flatten.uniq

    if self.price_changed? and self.label_changed?
      if combos.present?
        combos.each {|c| c.save!} 
      end
    elsif self.price_changed?
      if combos.present?
        combos.each {|c| c.save!}
      end
    elsif self.label_changed?
      if combos.present?
        combos.each {|c| c.save!}
      end
    end
    return true
  end

  def ensure_dish_not_referenced
    if combos.where(archive: false).empty?
      return true
    else
      errors.add(:base, "Combos present!")
      return false
    end
  end

end
